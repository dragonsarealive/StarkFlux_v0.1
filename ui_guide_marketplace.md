# StarkNet Dev-Components Marketplace UI Guide

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [User Roles](#user-roles)
- [Component Access Models](#component-access-models)
- [Pages and Views](#pages-and-views)
- [Core UI Components](#core-ui-components)
- [Smart Contract-Driven UI Components](#smart-contract-driven-ui-components)
- [User Journeys](#user-journeys)
  - [1. Visitor / New User](#1-visitor--new-user)
  - [2. Developer Registration & Management](#2-developer-registration--management)
  - [3. Browsing & Discovering Components](#3-browsing--discovering-components)
  - [4. Purchasing a Component (One-off Purchase)](#4-purchasing-a-component-one-off-purchase)
  - [5. Subscribing to the Marketplace](#5-subscribing-to-the-marketplace)
  - [6. Subscribing to a Developer](#6-subscribing-to-a-developer)
  - [7. Downloading/Using a Component](#7-downloadingusing-a-component)
  - [8. Managing Subscriptions](#8-managing-subscriptions)
  - [9. Free Component Access](#9-free-component-access)
  - [10. Admin/Platform Actions](#10-adminplatform-actions)
- [Wallet Integration](#wallet-integration)
- [Contract Interaction Patterns](#contract-interaction-patterns)
- [Responsive Design](#responsive-design)
- [Brave Browser Optimization](#brave-browser-optimization)
- [Security Considerations](#security-considerations)
- [Implementation Roadmap](#implementation-roadmap)

## Overview

This guide outlines the UI implementation for the StarkNet Dev-Components Marketplace, a platform where developers can register, sell, purchase, and subscribe to reusable code components on the StarkNet blockchain. The marketplace UI should be modern, intuitive, and provide a seamless experience for both component sellers and buyers.

## Architecture

### Tech Stack
- **Frontend Framework**: React with TypeScript
- **UI Component Library**: Chakra UI for consistent design
- **StarkNet Integration**: 
  - StarkNet.js for contract interaction
  - Starknet React for hooks and state management
  - StarknetKit for wallet connection
- **Routing**: React Router or Next.js for page navigation
- **State Management**: React Query + Context API
- **Build Tool**: Vite or Next.js

### Core Principles
1. **Modular Design**: Separate UI components, contract interactions, and business logic
2. **Responsive Layout**: Mobile-first approach with adaptive layouts
3. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with JS
4. **Performance Optimization**: Lazy loading, code splitting, and efficient contract calls

## User Roles

The marketplace supports three distinct user roles, each with specific capabilities and UI requirements:

### Visitor/User
- Any wallet browsing the marketplace
- May not be registered with the platform
- Can view component listings and details
- Can browse and download free components without connecting wallet
- Must connect wallet to purchase or subscribe
- UI should prompt for wallet connection when attempting paid actions

### Registered Developer
- A wallet that has called IdentityRegistry.register()
- Can upload and manage components
- Can set monetization mode (Direct, Marketplace, Dev Sub, Hybrid)
- Can configure component access models and pricing
- Receives revenue from sales and subscription usage
- UI should show developer dashboard and management tools

### Admin/Owner
- The platform's deploying or managing account
- Capable of platform-wide configuration and vault management
- Manages treasury and vault addresses
- Can pause/unpause components
- Controls oracle configuration
- Manages epoch transitions and payouts
- UI should provide admin dashboard with configuration panels

## Component Access Models

The marketplace supports four primary access models for components, defined by access_flags:

### Free (access_flags = 8)
- No payment or subscription required
- Cannot be combined with other access flags
- Must have zero price in both STRK and USD
- Immediate download access for all users
- Visual indicator: "FREE" badge
- Contract validation: ComponentRegistryV2.is_free(id)

### One-off Purchase (access_flags & 1)
- Direct payment for permanent access (BUY flag)
- 80/10/10 fee split (developer/platform/liquidity)
- Requires BUY flag and developer monetization_mode != 0
- Verified through ComponentRegistryV2.purchases mapping
- Visual indicator: "BUY" button with price display
- Contract interaction: ComponentRegistryV2.purchase_component(id)

### Marketplace Subscription (access_flags & 4)
- Monthly/epochal payment for access to all MKT_SUB components
- 45/45/10 fee split (reward pool/platform/liquidity)
- Usage-based rewards distributed to developers at epoch end
- Verified through MarketplaceSubscription.is_subscribed()
- Visual indicator: "Marketplace Subscription" badge
- Contract interaction: MarketplaceSubscription.subscribe()

### Developer Subscription (access_flags & 2)
- Payment to a specific developer for access to all their DEV_SUB components
- 80/10/10 fee split (developer/platform/liquidity)
- Fixed subscription period (30 days default)
- Verified through DevSubscription.is_subscribed()
- Visual indicator: "Developer Subscription" badge
- Contract interaction: DevSubscription.subscribe(dev_id)

### Hybrid Access
- Components may have combinations of BUY, DEV_SUB, and MKT_SUB flags
- UI must present all valid access options
- Users can choose preferred access method
- Free components cannot have hybrid access

## Pages and Views

### 1. Home Page
- Hero section highlighting the marketplace purpose
- Featured components with visual cards
- Categories/tags filter section
- Quick stats (total components, developers, etc.)
- Call-to-action buttons for registration and browsing

### 2. Component Browsing
- Grid/list view of available components
- Filtering options:
  - Price range (STRK or USD)
  - Categories/tags
  - Access flags (Free, BUY, DEV_SUB, MKT_SUB)
  - Active status
- Sorting options (newest, price, popularity)
- Search functionality
- Pagination or infinite scroll

### 3. Component Detail Page
- Component title, reference, and description
- Seller information with reputation score
- Pricing information (STRK or USD equivalent)
- Access flag badges showing available access methods
- "Purchase", "Subscribe", or "Download" buttons based on access flags
- Related components section

### 4. Developer Profile Page
- Developer identity information
- Reputation score visualization
- Upload history
- Sales history
- Components published by the developer
- "Subscribe to Developer" button if they offer DEV_SUB components

### 5. User Dashboard
- Account overview
- Purchased components
- Active subscriptions with expiry dates
- Transaction history
- Download history

### 6. Developer Dashboard
- Component management tools
- Upload new component form
- Monetization mode settings
- Revenue statistics
- Download analytics

### 7. Admin Panel
- Fee management interface
- Component moderation tools
- Address configuration options
- Oracle settings
- Epoch management controls

## Core UI Components

### 1. Wallet Connection
```jsx
<WalletConnectButton 
  label="Connect Wallet"
  supportedWallets={['ArgentX', 'Braavos']}
/>
```

### 2. Component Card
```jsx
<ComponentCard
  id={component.id}
  title={component.title}
  seller={component.seller}
  price={component.pricing}
  isActive={component.is_active}
  accessFlags={component.access_flags}
  thumbnailUrl={thumbnailUrl}
/>
```

### 3. Developer Identity Badge
```jsx
<IdentityBadge
  address={identity.owner}
  id={identity.id}
  joinDate={identity.join_timestamp}
  uploadCount={identity.upload_count}
  totalSales={identity.total_sales_strk}
  reputationScore={reputationScore}
/>
```

### 4. Subscription Status
```jsx
<SubscriptionStatus
  type="marketplace" // or "developer" with devId prop
  expiry={subscription.expiry}
  isActive={isSubscriptionActive}
  onRenew={() => handleRenew()}
  onCancel={() => handleCancel()}
/>
```

### 5. Price Display
```jsx
<PriceDisplay
  priceStrk={component.pricing.price_strk}
  priceUsdMicros={component.pricing.price_usd_micros}
  priceFeedKey={component.price_feed_key}
/>
```

### 6. Access Flags Badge
```jsx
<AccessFlagsBadge
  accessFlags={component.access_flags}
  isFree={component.is_free}
  supportsBuy={Boolean(component.access_flags & 1)}
  supportsDevSub={Boolean(component.access_flags & 2)}
  supportsMktSub={Boolean(component.access_flags & 4)}
/>
```

### 7. Download Button
```jsx
<DownloadButton
  componentId={component.id}
  isFree={component.is_free}
  userHasPurchased={userPurchases.includes(component.id)}
  userHasMarketplaceSub={isMarketplaceSubscribed && (component.access_flags & 4)}
  userHasDevSub={isDevSubscribed(component.seller_id) && (component.access_flags & 2)}
  onDownload={() => handleDownload(component.id)}
/>
```

## Smart Contract-Driven UI Components

This section maps specific smart contract elements to their visual representations in the marketplace UI.

### ComponentRegistry UI Components

#### Component Display Card
```jsx
// Enhanced component card with all details from ComponentRegistryV2
const EnhancedComponentCard = ({ component }) => {
  const { 
    id, title, reference, seller, pricing, 
    is_active, is_subscription_eligible,
    price_feed_key, registration_timestamp 
  } = component;
  
  // Dynamic pricing display based on pricing type
  const isPricedInUsd = pricing.price_usd_micros > 0;
  
  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      p={4}
      bg={is_active ? "white" : "gray.100"}
      opacity={is_active ? 1 : 0.7}
    >
      <Flex justifyContent="space-between" mb={2}>
        <Heading size="md">{title}</Heading>
        <HStack>
          {is_active && <Badge colorScheme="green">Active</Badge>}
          {!is_active && <Badge colorScheme="red">Inactive</Badge>}
          {is_subscription_eligible && (
            <Badge colorScheme="purple">Subscription Available</Badge>
          )}
        </HStack>
      </Flex>
      
      <Text fontSize="sm" mb={3}>Reference: {reference}</Text>
      
      <Flex justifyContent="space-between" align="center">
        <SellerBadge address={seller} />
        <DynamicPriceDisplay 
          priceStrk={pricing.price_strk} 
          priceUsdMicros={pricing.price_usd_micros}
          priceFeedKey={price_feed_key}
        />
      </Flex>
      
      <Text fontSize="xs" color="gray.500" mt={2}>
        Listed on {new Date(registration_timestamp * 1000).toLocaleDateString()}
      </Text>
      
      <ButtonGroup mt={4} width="100%">
        <Button 
          colorScheme="blue" 
          width="50%" 
          leftIcon={<FaShoppingCart />}
        >
          Purchase
        </Button>
        {is_subscription_eligible && (
          <Button 
            colorScheme="purple" 
            width="50%" 
            leftIcon={<FaCalendarAlt />}
          >
            Subscribe
          </Button>
        )}
      </ButtonGroup>
    </Box>
  );
};
```

#### Dynamic Price Display
```jsx
// Handles both fixed STRK and oracle-based USD pricing
const DynamicPriceDisplay = ({ priceStrk, priceUsdMicros, priceFeedKey }) => {
  // Use contract data to determine pricing type
  const isPricedInUsd = priceUsdMicros > 0;
  const isPricedInStrk = priceStrk > 0;
  
  // For USD-priced components, we need to fetch the current oracle price
  const { data: currentStrkPrice, isLoading } = useOraclePrice(
    isPricedInUsd ? priceFeedKey : null
  );
  
  if (isPricedInStrk) {
    return (
      <PriceBox 
        amount={priceStrk}
        denomination="STRK"
        formattedAmount={formatStrkAmount(priceStrk)}
      />
    );
  }
  
  if (isPricedInUsd && isLoading) {
    return <Skeleton height="20px" width="100px" />;
  }
  
  if (isPricedInUsd && currentStrkPrice) {
    const equivalentStrk = calculateEquivalentStrk(
      priceUsdMicros, 
      currentStrkPrice
    );
    
    return (
      <VStack align="flex-end" spacing={0}>
        <PriceBox 
          amount={priceUsdMicros}
          denomination="USD"
          formattedAmount={formatUsdMicros(priceUsdMicros)}
        />
        <Text fontSize="xs" color="gray.500">
          ≈ {formatStrkAmount(equivalentStrk)} STRK
        </Text>
      </VStack>
    );
  }
  
  return <Text>Price unavailable</Text>;
};
```

#### Component Registration Form
```jsx
// Form for registering new components with all required fields
const ComponentRegistrationForm = () => {
  const [title, setTitle] = useState("");
  const [reference, setReference] = useState("");
  const [pricingType, setPricingType] = useState("strk"); // "strk" or "usd"
  const [priceStrk, setPriceStrk] = useState("");
  const [priceUsdMicros, setPriceUsdMicros] = useState("");
  const [priceFeedKey, setPriceFeedKey] = useState("");
  const [isSubscriptionEligible, setIsSubscriptionEligible] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare arguments based on pricing type
    const args = [
      title,
      reference,
      pricingType === "strk" ? priceStrk : "0",
      pricingType === "usd" ? priceUsdMicros : "0",
      pricingType === "usd" ? priceFeedKey : "0",
      isSubscriptionEligible,
    ];
    
    // Use StarkNet React hook for contract interaction
    await writeContract({
      functionName: "register_component",
      args,
    });
  };
  
  return (
    <VStack as="form" spacing={4} onSubmit={handleSubmit}>
      <FormControl isRequired>
        <FormLabel>Title</FormLabel>
        <Input 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Component Title"
        />
      </FormControl>
      
      <FormControl isRequired>
        <FormLabel>Reference (e.g., IPFS CID, Git URL)</FormLabel>
        <Input 
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Reference"
        />
      </FormControl>
      
      <FormControl as="fieldset" isRequired>
        <FormLabel as="legend">Pricing Type</FormLabel>
        <RadioGroup value={pricingType} onChange={setPricingType}>
          <HStack>
            <Radio value="strk">Fixed STRK Price</Radio>
            <Radio value="usd">USD Price (Oracle-based)</Radio>
          </HStack>
        </RadioGroup>
      </FormControl>
      
      {pricingType === "strk" && (
        <FormControl isRequired>
          <FormLabel>Price (STRK)</FormLabel>
          <InputGroup>
            <Input 
              value={priceStrk}
              onChange={(e) => setPriceStrk(e.target.value)}
              placeholder="0.0"
              type="number"
              step="0.000000000000000001"
              min="0"
            />
            <InputRightAddon>STRK</InputRightAddon>
          </InputGroup>
        </FormControl>
      )}
      
      {pricingType === "usd" && (
        <>
          <FormControl isRequired>
            <FormLabel>Price (USD)</FormLabel>
            <InputGroup>
              <Input 
                value={priceUsdMicros}
                onChange={(e) => setPriceUsdMicros(e.target.value)}
                placeholder="0.0"
                type="number"
                step="0.000001"
                min="0"
              />
              <InputRightAddon>USD</InputRightAddon>
            </InputGroup>
            <FormHelperText>
              Enter price in USD micro-units (1 USD = 1,000,000 micro-units)
            </FormHelperText>
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Price Feed Key</FormLabel>
            <Select
              value={priceFeedKey}
              onChange={(e) => setPriceFeedKey(e.target.value)}
              placeholder="Select price feed"
            >
              <option value="STRK/USD">STRK/USD</option>
              <option value="ETH/USD">ETH/USD</option>
            </Select>
          </FormControl>
        </>
      )}
      
      <FormControl>
        <Checkbox
          isChecked={isSubscriptionEligible}
          onChange={(e) => setIsSubscriptionEligible(e.target.checked)}
        >
          Make eligible for subscription
        </Checkbox>
        <FormHelperText>
          Allow users to subscribe to this component instead of one-time purchase
        </FormHelperText>
      </FormControl>
      
      <Button 
        type="submit" 
        colorScheme="blue" 
        width="100%"
        leftIcon={<FaUpload />}
      >
        Register Component
      </Button>
    </VStack>
  );
};
```

### IdentityRegistry UI Components

#### Developer Profile Card
```jsx
const DeveloperProfileCard = ({ identity, reputationScore }) => {
  const { 
    id, owner, join_timestamp, 
    upload_count, total_sales_strk 
  } = identity;
  
  return (
    <Box borderWidth="1px" borderRadius="lg" p={5}>
      <VStack align="stretch" spacing={4}>
        <HStack>
          <Avatar 
            size="lg" 
            src={`https://robohash.org/${owner}?set=set3`} 
          />
          <VStack align="start" spacing={0}>
            <Heading size="md">Developer #{id}</Heading>
            <HStack>
              <Text fontSize="xs" color="gray.500">
                {shortenAddress(owner)}
              </Text>
              <CopyButton text={owner} />
            </HStack>
            <Text fontSize="sm">
              Member since {new Date(join_timestamp * 1000).toLocaleDateString()}
            </Text>
          </VStack>
        </HStack>
        
        <SimpleGrid columns={3} spacing={4}>
          <Stat>
            <StatLabel>Reputation</StatLabel>
            <StatNumber>{reputationScore}</StatNumber>
            <ReputationBadge score={reputationScore} />
          </Stat>
          <Stat>
            <StatLabel>Uploads</StatLabel>
            <StatNumber>{upload_count}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Total Sales</StatLabel>
            <StatNumber>{formatStrkAmount(total_sales_strk)}</StatNumber>
            <StatHelpText>STRK</StatHelpText>
          </Stat>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};
```

#### Reputation Score Visualization
```jsx
const ReputationBadge = ({ score }) => {
  // Determine badge type based on reputation score
  let color, label;
  
  if (score >= 5000) {
    color = "purple";
    label = "Elite";
  } else if (score >= 1000) {
    color = "blue";
    label = "Expert";
  } else if (score >= 500) {
    color = "green";
    label = "Established";
  } else if (score >= 100) {
    color = "yellow";
    label = "Growing";
  } else {
    color = "gray";
    label = "New";
  }
  
  return (
    <Badge colorScheme={color} variant="solid" borderRadius="full" px={2}>
      {label}
    </Badge>
  );
};

const ReputationChart = ({ uploadCount, totalSales }) => {
  // Calculate reputation score components
  const uploadScore = uploadCount * 100;
  const salesScore = totalSales / 10000000000000000; // 0.01 STRK = 1 point
  const totalScore = uploadScore + salesScore;
  
  // Data for chart
  const data = [
    { name: 'Uploads', value: uploadScore },
    { name: 'Sales', value: salesScore },
  ];
  
  return (
    <Box>
      <Heading size="sm" mb={2}>Reputation Breakdown</Heading>
      <Text fontSize="xs" color="gray.500" mb={4}>
        Total Score: {totalScore.toLocaleString()}
      </Text>
      
      <PieChart width={200} height={200}>
        <Pie
          data={data}
          cx={100}
          cy={100}
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index === 0 ? '#0088FE' : '#00C49F'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </Box>
  );
};
```

### SubscriptionManager UI Components

#### Subscription Status Card
```jsx
const SubscriptionStatusCard = ({ subscription, componentData }) => {
  const { expiry } = subscription;
  const now = Math.floor(Date.now() / 1000);
  const isActive = expiry > now;
  
  // Calculate remaining time
  const remainingSeconds = isActive ? expiry - now : 0;
  const remainingDays = Math.floor(remainingSeconds / 86400);
  
  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      p={4}
      bg={isActive ? "green.50" : "gray.50"}
    >
      <Flex justifyContent="space-between" align="center" mb={3}>
        <Heading size="sm">{componentData.title}</Heading>
        {isActive ? (
          <Badge colorScheme="green">Active</Badge>
        ) : (
          <Badge colorScheme="red">Expired</Badge>
        )}
      </Flex>
      
      {isActive ? (
        <VStack align="stretch" spacing={2}>
          <Text fontSize="sm">
            Expires: {new Date(expiry * 1000).toLocaleDateString()}
          </Text>
          <Progress 
            value={remainingDays} 
            max={30} // Assuming 30-day subscription
            colorScheme="green" 
            size="sm" 
            borderRadius="full"
          />
          <Text fontSize="xs" textAlign="right">
            {remainingDays} days remaining
          </Text>
          
          <ButtonGroup width="100%" mt={2}>
            <Button 
              colorScheme="blue" 
              size="sm" 
              leftIcon={<FaSyncAlt />}
              isDisabled={remainingDays > 7}
            >
              Renew
            </Button>
            <Button 
              colorScheme="red" 
              variant="outline" 
              size="sm"
              leftIcon={<FaTimes />}
            >
              Cancel
            </Button>
          </ButtonGroup>
        </VStack>
      ) : (
        <VStack align="stretch" spacing={2}>
          <Text fontSize="sm">
            Expired on: {new Date(expiry * 1000).toLocaleDateString()}
          </Text>
          <Button 
            colorScheme="blue" 
            width="100%" 
            leftIcon={<FaRedo />}
          >
            Resubscribe
          </Button>
        </VStack>
      )}
    </Box>
  );
};
```

#### Subscription Duration Selector
```jsx
const SubscriptionDurationSelector = ({ onChange }) => {
  const [duration, setDuration] = useState(30); // Default: 30 days
  
  const handleChange = (newDuration) => {
    setDuration(newDuration);
    onChange(newDuration);
  };
  
  return (
    <FormControl>
      <FormLabel>Subscription Duration</FormLabel>
      <RadioGroup 
        value={duration.toString()} 
        onChange={(val) => handleChange(parseInt(val))}
      >
        <VStack align="stretch" spacing={3}>
          <Radio value="30">
            <Flex justify="space-between" width="100%" pr={4}>
              <Text>1 Month</Text>
              <Text fontWeight="bold">30 days</Text>
            </Flex>
          </Radio>
          <Radio value="90">
            <Flex justify="space-between" width="100%" pr={4}>
              <Text>3 Months</Text>
              <Text fontWeight="bold">90 days</Text>
              <Badge colorScheme="green">5% off</Badge>
            </Flex>
          </Radio>
          <Radio value="180">
            <Flex justify="space-between" width="100%" pr={4}>
              <Text>6 Months</Text>
              <Text fontWeight="bold">180 days</Text>
              <Badge colorScheme="green">10% off</Badge>
            </Flex>
          </Radio>
          <Radio value="365">
            <Flex justify="space-between" width="100%" pr={4}>
              <Text>1 Year</Text>
              <Text fontWeight="bold">365 days</Text>
              <Badge colorScheme="green">15% off</Badge>
            </Flex>
          </Radio>
        </VStack>
      </RadioGroup>
    </FormControl>
  );
};
```

## User Journeys

The following sections detail the key user journeys through the marketplace, mapping UI components to contract interactions for each flow.

### 1. Visitor / New User

#### Browsing Components
- **UI Flow:**
  - Landing page with grid/list of featured components
  - Filter components by type, price range, access model
  - View component cards with basic information

- **UI Components:**
```jsx
  <ComponentGrid 
    components={components}
    filters={activeFilters}
    onFilterChange={handleFilterChange}
  />
  
  <ComponentCard 
    component={component}
    showAccessBadges={true}
    showPriceInfo={true}
  />
  ```

- **Contract Interactions:**
  ```jsx
  // Fetch components (via indexer or contract)
  const { data: component } = useReadContract({
    functionName: 'get_component',
    args: [componentId],
  });
  
  // Check if component is free
  const { data: isFree } = useReadContract({
    functionName: 'is_free',
    args: [componentId],
  });
  
  // Get access flags
  const { data: accessFlags } = useReadContract({
    functionName: 'get_access_flags',
    args: [componentId],
  });
  ```

- **UI States:**
  - Show appropriate badges based on access_flags
  - Display "Connect Wallet" prompt for purchase/subscription options
  - Enable direct download for free components

### 2. Developer Registration & Management

#### Registering as a Developer
- **UI Flow:**
  - "Become a Developer" prominent CTA button
  - Wallet connection if not connected
  - Registration form with terms acceptance

- **UI Components:**
  ```jsx
  <RegisterDeveloperButton 
    onClick={handleRegister}
    isConnected={isWalletConnected}
  />
  
  {!isWalletConnected && (
    <WalletConnectPrompt 
      message="Connect your wallet to register as a developer"
    />
  )}
  ```

- **Contract Interactions:**
  ```jsx
  // Register as developer
  const { writeContract } = useWriteContract();
  
  const handleRegister = async () => {
    await writeContract({
      functionName: 'register',
      args: [],
    });
};
```

- **Success State:**
  - Redirect to developer dashboard
  - Display developer ID and profile information

#### Setting Monetization Mode
- **UI Flow:**
  - Settings/preferences section in developer dashboard
  - Monetization mode selector with explanations

- **UI Components:**
```jsx
  <MonetizationModeSelector
    currentMode={monetizationMode}
    onChange={handleModeChange}
    descriptions={modeDescriptions}
  />
  ```

- **Contract Interactions:**
  ```jsx
  // Get current mode
  const { data: currentMode } = useReadContract({
    functionName: 'get_monetization_mode',
    args: [address],
  });
  
  // Set mode
  const handleModeChange = async (newMode) => {
    await writeContract({
      functionName: 'set_monetization_mode',
      args: [newMode],
    });
};
```

- **Success State:**
  - Update UI to reflect selected mode
  - Enable/disable related options in component upload form

#### Uploading a Component
- **UI Flow:**
  - "Upload Component" button in developer dashboard
  - Multi-step form with validation
  - Preview and confirmation step

- **UI Components:**
```jsx
  <ComponentUploadForm
    developerMode={monetizationMode}
    onSubmit={handleUpload}
  >
    <TitleInput />
    <ReferenceInput />
    <AccessFlagsSelector disableFreeIfOthersSelected={true} />
    <PricingForm showUsdOption={true} />
    <SubmitButton />
  </ComponentUploadForm>
  ```

- **Contract Interactions:**
  ```jsx
  const handleUpload = async (formData) => {
    const { title, reference, priceStrk, priceUsdMicros, priceFeedKey, accessFlags } = formData;
    
    await writeContract({
      functionName: 'register_component',
      args: [title, reference, priceStrk, priceUsdMicros, priceFeedKey, accessFlags],
    });
  };
  ```

- **Success State:**
  - Success confirmation with component details
  - Redirect to component detail page
  - Update developer dashboard with new component

### 3. Browsing & Discovering Components

#### Filtering/Searching
- **UI Flow:**
  - Search bar in header
  - Advanced filter panel with multiple criteria
  - Real-time results update

- **UI Components:**
  ```jsx
  <SearchBar onSearch={handleSearch} />
  
  <FilterPanel>
    <PriceRangeFilter min={0} max={100} />
    <AccessTypeFilter options={['Free', 'Paid', 'Marketplace Sub', 'Dev Sub']} />
    <DeveloperFilter developers={topDevelopers} />
    <CategoryFilter categories={availableCategories} />
  </FilterPanel>
  
  <SortSelector 
    options={['Newest', 'Price (Low-High)', 'Price (High-Low)', 'Most Downloaded']}
    onChange={handleSortChange}
  />
  ```

- **Contract/Backend Interactions:**
  - Off-chain indexing for efficient filtering
  - On-chain verification for selected components

- **Success State:**
  - Filtered grid of components matching criteria
  - Empty state with suggestions if no results

#### Viewing Component Details
- **UI Flow:**
  - Click on component card to view details
  - Comprehensive information page
  - Access options based on component flags

- **UI Components:**
  ```jsx
  <ComponentDetailView
    component={component}
    userAccessStatus={{
      hasPurchased: userPurchases.includes(component.id),
      hasMarketplaceSub: isMarketplaceSubscribed,
      hasDevSub: isDevSubscribed(component.seller_id)
    }}
  >
    <ComponentInfoSection />
    <DeveloperSection developer={developer} />
    <AccessOptionsSection 
      accessFlags={component.access_flags}
      isFree={component.is_free}
      price={component.price}
      priceUsd={component.price_usd}
    />
  </ComponentDetailView>
  ```

- **Contract Interactions:**
  ```jsx
  // Get component details
  const { data: component } = useReadContract({
    functionName: 'get_component',
    args: [componentId],
  });
  
  // Check user's access rights
  const { data: hasPurchased } = useReadContract({
    functionName: 'has_purchased',
    args: [address, componentId],
  });
  ```

### 4. Purchasing a Component (One-off Purchase)

#### Initiate Purchase
- **UI Flow:**
  - "Buy Now" button on component details page
  - Wallet connection prompt if not connected
  - Purchase confirmation modal with price details

- **UI Components:**
  ```jsx
  <BuyButton
    component={component}
    isEnabled={component.access_flags & 1}
    isWalletConnected={isWalletConnected}
    onBuy={handleBuy}
  />
  
  <PurchaseConfirmationModal
    isOpen={isConfirmModalOpen}
    onClose={() => setConfirmModalOpen(false)}
    onConfirm={confirmPurchase}
    price={currentPrice}
    component={component}
  />
  ```

- **Contract Interactions:**
  ```jsx
  // Get current price (for USD-priced components)
  const { data: currentPrice } = useReadContract({
    functionName: 'get_current_price_strk',
    args: [componentId],
  });
  
  // Purchase component
  const handleBuy = async () => {
    await writeContract({
      functionName: 'purchase_component',
      args: [componentId],
    });
  };
  ```

- **Success State:**
  - Transaction confirmation notification
  - Update UI to show purchased state
  - Enable download button

### 5. Subscribing to the Marketplace

#### Initiate Subscription
- **UI Flow:**
  - "Subscribe to Marketplace" button in header/sidebar
  - Wallet connection prompt if needed
  - Subscription options page with duration options

- **UI Components:**
  ```jsx
  <MarketplaceSubscriptionButton
    isWalletConnected={isWalletConnected}
    currentPrice={subscriptionPrice}
    isSubscribed={isSubscribed}
    expiryDate={subscriptionExpiry}
    onSubscribe={handleSubscribe}
  />
  
  <SubscriptionConfirmationModal
    isOpen={isConfirmModalOpen}
    onClose={() => setConfirmModalOpen(false)}
    onConfirm={confirmSubscription}
    price={subscriptionPrice}
    duration="30 days"
  />
  ```

- **Contract Interactions:**
  ```jsx
  // Get subscription price
  const { data: subscriptionPrice } = useReadContract({
    functionName: 'get_price',
  });
  
  // Check if already subscribed
  const { data: isSubscribed } = useReadContract({
    functionName: 'is_subscribed',
    args: [address],
  });
  
  // Subscribe
  const handleSubscribe = async () => {
    await writeContract({
      functionName: 'subscribe',
      args: [],
    });
  };
  ```

- **Success State:**
  - Transaction confirmation notification
  - Update UI to show subscribed state with expiry
  - Enable access to all marketplace-eligible components

### 6. Subscribing to a Developer

#### Initiate Dev Subscription
- **UI Flow:**
  - "Subscribe to Developer" button on developer profile or component details
  - Subscription options with pricing
  - Confirmation modal

- **UI Components:**
  ```jsx
  <DeveloperSubscriptionButton
    developerId={developerId}
    developerName={developerName}
    isWalletConnected={isWalletConnected}
    currentPrice={devSubscriptionPrice}
    isSubscribed={isDevSubscribed}
    expiryDate={devSubscriptionExpiry}
    onSubscribe={handleDevSubscribe}
  />
  ```

- **Contract Interactions:**
  ```jsx
  // Get developer subscription price
  const { data: devSubscriptionPrice } = useReadContract({
    functionName: 'get_price',
    args: [developerId],
  });
  
  // Check if already subscribed to this developer
  const { data: isDevSubscribed } = useReadContract({
    functionName: 'is_subscribed',
    args: [address, developerId],
  });
  
  // Subscribe to developer
  const handleDevSubscribe = async () => {
    await writeContract({
      functionName: 'subscribe',
      args: [developerId],
    });
};
```

- **Success State:**
  - Transaction confirmation
  - Developer subscription added to user's dashboard
  - Access enabled to developer's DEV_SUB components

### 7. Downloading/Using a Component

#### Free Component Download
- **UI Flow:**
  - "Download" button always enabled for free components
  - No wallet connection required

- **UI Components:**
  ```jsx
  <DownloadButton
    componentId={component.id}
    isFree={component.is_free}
    onDownload={handleDownload}
    alwaysEnabled={component.is_free}
  />
  ```

- **Contract Interactions:**
  ```jsx
  // Verify component is free
  const { data: isFree } = useReadContract({
    functionName: 'is_free',
    args: [componentId],
  });
  ```

- **Success State:**
  - Component resource served to user

#### Paid / Subscribed Component Download
- **UI Flow:**
  - "Download" button enabled based on access rights
  - Access verification based on purchase or subscription

- **UI Components:**
```jsx
  <DownloadButton
    componentId={component.id}
    isFree={component.is_free}
    userHasPurchased={userPurchases.includes(component.id)}
    userHasMarketplaceSub={isMarketplaceSubscribed && (component.access_flags & 4)}
    userHasDevSub={isDevSubscribed(component.seller_id) && (component.access_flags & 2)}
    onDownload={handlePaidDownload}
  />
  ```

- **Contract Interactions:**
  ```jsx
  // Record download for marketplace statistics and rewards
  const handlePaidDownload = async () => {
    if (!component.is_free) {
      await writeContract({
        functionName: 'record_download',
        args: [address, componentId],
      });
    }
    // Serve the component resource
    fetchComponentResource(componentId);
  };
  ```

- **Success State:**
  - Component resource served to user
  - Download recorded for reward distribution

### 8. Managing Subscriptions

#### Viewing Subscriptions
- **UI Flow:**
  - "My Subscriptions" section in user dashboard
  - List of active subscriptions with expiry dates

- **UI Components:**
  ```jsx
  <SubscriptionDashboard>
    <MarketplaceSubscriptionCard
      isSubscribed={isMarketplaceSubscribed}
      expiryDate={marketplaceExpiry}
      onRenew={handleMarketplaceRenewal}
    />
    
    <DeveloperSubscriptionsList
      subscriptions={devSubscriptions}
      onRenewDev={handleDevRenewal}
    />
  </SubscriptionDashboard>
  ```

- **Contract Interactions:**
  ```jsx
  // Check marketplace subscription status
  const { data: marketplaceExpiry } = useReadContract({
    functionName: 'get_subscription_expiry',
    args: [address],
  });
  
  // Fetch developer subscriptions
  const { data: devSubscriptions } = useDevSubscriptions(address, developerIds);
  ```

- **Success State:**
  - Comprehensive view of all active subscriptions
  - Expiry information and renewal options

### 9. Free Component Access

#### Accessing Free Components
- **UI Flow:**
  - Free components clearly marked
  - Download button always enabled
  - No wallet connection required

- **UI Components:**
  ```jsx
  <FreeComponentBadge />
  
  <DownloadButton
    componentId={component.id}
    isFree={true}
    alwaysEnabled={true}
    onDownload={handleFreeDownload}
  />
  ```

- **Contract Interactions:**
  ```jsx
  // Verify component is free
  const { data: isFree } = useReadContract({
    functionName: 'is_free',
    args: [componentId],
  });
  ```

- **Success State:**
  - Direct access to component resource

### 10. Admin/Platform Actions

#### Set/Change Fee Splits
- **UI Flow:**
  - Admin dashboard with fee configuration section
  - Input fields for platform/liquidity percentages
  - Save button with confirmation

- **UI Components:**
  ```jsx
  <AdminFeeSplitForm
    currentPlatformBps={platformFeeBps}
    currentLiquidityBps={liquidityFeeBps}
    onSave={handleFeeSplitUpdate}
  />
  ```

- **Contract Interactions:**
  ```jsx
  // Update fee split
  const handleFeeSplitUpdate = async (platformBps, liquidityBps) => {
    await writeContract({
      functionName: 'set_fee_split',
      args: [platformBps, liquidityBps],
          });
      };
  ```

- **Success State:**
  - Updated fee splits reflected in UI
  - Transaction confirmation

#### Epoch Management
- **UI Flow:**
  - Admin dashboard with epoch control panel
  - Current epoch stats
  - Start new epoch button with confirmation

- **UI Components:**
  ```jsx
  <EpochManagementPanel
    currentEpochStart={epochStartTimestamp}
    currentEpochEnd={epochEndTimestamp}
    rewardPoolAmount={rewardPoolStrk}
    onStartNewEpoch={handleStartNewEpoch}
  />
  ```

- **Contract Interactions:**
  ```jsx
  // Start new epoch
  const handleStartNewEpoch = async () => {
    await writeContract({
      functionName: 'start_new_epoch',
      args: [],
    });
};
```

- **Success State:**
  - New epoch started
  - Rewards distributed
  - Transaction confirmation

## Wallet Integration

### Supported Wallets
- ArgentX
- Braavos
- MetaMask (with StarkNet Snap)
- OKX Wallet

### Implementation with StarknetKit
```jsx
import { connect } from 'starknetkit';

const ConnectWalletButton = () => {
  const [connection, setConnection] = useState(null);

  const connectWallet = async () => {
    const { wallet } = await connect({
      modalOptions: {
        theme: 'light',
        walletListItems: {
          argentX: true,
          braavos: true,
        },
      },
    });

    if (wallet) {
      setConnection(wallet);
      // Connect to contracts here
    }
  };

  return (
    <Button onClick={connectWallet} colorScheme="blue">
      {connection ? 'Wallet Connected' : 'Connect Wallet'}
    </Button>
  );
};
```

## Contract Interaction Patterns

### ComponentRegistry Interactions

#### Fetching Component Details
```jsx
import { useContract, useReadContract } from 'starknet-react';
import { registry_abi } from '../abi/registry_abi';

const ComponentDetail = ({ componentId }) => {
  const { contract } = useContract({
    address: REGISTRY_ADDRESS,
    abi: registry_abi,
  });

  const { data, isLoading, error } = useReadContract({
    functionName: 'get_component',
    args: [componentId],
    watch: true,
  });

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorAlert message={error.message} />;

  return (
    <ComponentDetailView component={data} />
  );
};
```

#### Purchasing a Component
```jsx
import { useContract, useWriteContract } from 'starknet-react';

const PurchaseButton = ({ componentId }) => {
  const { contract } = useContract({
    address: REGISTRY_ADDRESS,
    abi: registry_abi,
  });

  const { writeContract, isPending, isError } = useWriteContract();

  const handlePurchase = async () => {
    try {
      await writeContract({
        functionName: 'purchase_component',
        args: [componentId],
      });
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  return (
    <Button 
      onClick={handlePurchase} 
      isLoading={isPending}
      isDisabled={isError}
      colorScheme="green"
    >
      Purchase Component
    </Button>
  );
};
```

### IdentityRegistry Interactions

#### Registering an Identity
```jsx
const RegisterButton = () => {
  const { contract } = useContract({
    address: IDENTITY_REGISTRY_ADDRESS,
    abi: identity_registry_abi,
  });

  const { writeContract, isPending } = useWriteContract();

  const handleRegister = async () => {
    try {
      await writeContract({
        functionName: 'register',
        args: [],
      });
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <Button 
      onClick={handleRegister} 
      isLoading={isPending}
      colorScheme="purple"
    >
      Register Developer Identity
    </Button>
  );
};
```

### SubscriptionManager Interactions

#### Managing Subscriptions
```jsx
const SubscribeButton = ({ componentId, durationDays = 30 }) => {
  const { contract } = useContract({
    address: SUBSCRIPTION_MANAGER_ADDRESS,
    abi: subscription_manager_abi,
  });

  const { writeContract, isPending } = useWriteContract();

  const handleSubscribe = async () => {
    try {
      await writeContract({
        functionName: 'subscribe',
        args: [componentId, durationDays],
      });
    } catch (error) {
      console.error('Subscription failed:', error);
    }
  };

  return (
    <Button 
      onClick={handleSubscribe} 
      isLoading={isPending}
      colorScheme="blue"
    >
      Subscribe for {durationDays} Days
    </Button>
  );
};
```

## Responsive Design

### Breakpoints
- Mobile: < 480px
- Tablet: 480px - 768px 
- Desktop: > 768px

### Mobile Considerations
- Single column layout for component listings
- Collapsible filters and search
- Simplified card views
- Bottom-fixed action buttons
- Touch-friendly input elements

### Desktop Enhancements
- Multi-column grid layouts
- Sidebar filters
- Detailed component cards
- Hover states and tooltips
- Advanced sorting options

### Implementation Example
```jsx
// Component Card responsive styling with Chakra UI
<Box
  borderWidth="1px"
  borderRadius="lg"
  overflow="hidden"
  width={{ base: "100%", md: "300px" }}
  transition="transform 0.3s"
  _hover={{ transform: "translateY(-5px)" }}
>
  <Image src={thumbnail} alt={title} height={{ base: "150px", md: "200px" }} />
  <Box p="6">
    <Heading size={{ base: "sm", md: "md" }}>{title}</Heading>
    <Text fontSize={{ base: "xs", md: "sm" }} mt={2} noOfLines={2}>
      {description}
    </Text>
    <Flex 
      justifyContent="space-between" 
      alignItems="center"
      flexDir={{ base: "column", sm: "row" }}
      mt={4}
    >
      <Text fontWeight="bold">{formatPrice(price)}</Text>
      <Button size={{ base: "sm", md: "md" }}>View Details</Button>
    </Flex>
  </Box>
</Box>
```

## Security Considerations

### Smart Contract Interaction
- Always verify transaction parameters before signing
- Display clear confirmation modals for all transactions
- Show approximate gas fees before confirming
- Implement transaction timeouts and retry mechanisms

### User Data Protection
- Store minimal user data in local storage
- Never store private keys or seed phrases
- Use secure connections (HTTPS)
- Implement proper CORS policies for API calls

### Error Handling
- Graceful degradation for network issues
- Clear error messages for failed transactions
- Automatic retry for non-critical failures
- Logging and monitoring for repeated failures

### Transaction Guards
```jsx
const SafeTransactionButton = ({ onClick, children }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const handleClick = () => {
    setShowConfirmation(true);
  };
  
  const handleConfirm = () => {
    onClick();
    setShowConfirmation(false);
  };
  
  const handleCancel = () => {
    setShowConfirmation(false);
  };
  
  return (
    <>
      <Button onClick={handleClick} colorScheme="blue">
        {children}
      </Button>
      
      <Modal isOpen={showConfirmation} onClose={handleCancel}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Transaction</ModalHeader>
          <ModalBody>
            <Text>Are you sure you want to proceed with this transaction?</Text>
            <Text fontSize="sm" color="gray.500" mt={2}>
              This will require a wallet signature and network fee.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={handleCancel}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleConfirm}>Confirm</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
```

## Implementation Roadmap

### Phase 1: Core Functionality
1. Wallet connection interface
2. Component browsing and details pages
3. Basic purchase and subscription flows
4. Developer registration

### Phase 2: Enhanced Features
1. Advanced filtering and search
2. User dashboard and transaction history
3. Component ratings and reviews
4. Subscription management interface

### Phase 3: Advanced Features
1. Social sharing and embedding
2. Component previews and demos
3. Bulk purchasing and management
4. Advanced analytics for developers

### Phase 4: Optimization
1. Performance improvements
2. Mobile app implementation
3. Browser extension integration
4. Multi-language support

## Conclusion

This UI guide provides a comprehensive framework for building the StarkNet Dev-Components Marketplace front-end. By following these patterns and best practices, developers can create a responsive, secure, and user-friendly interface that leverages the power of the underlying smart contracts.

Remember to continuously test with real users and gather feedback to refine the experience. The marketplace's success will depend not only on the quality of the components listed but also on the quality of the user experience. 