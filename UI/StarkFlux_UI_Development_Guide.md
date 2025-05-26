# StarkFlux UI Development Guide

This guide outlines the visual components and user interfaces needed to effectively leverage the StarkFlux marketplace smart contracts. It is based on the existing UI guide and focuses on the essential elements required for the MVP implementation.

## 1. Design System Overview

### 1.1. Core Visual Components

- **Color Palette**:
  - Primary: Deep Red (#D81F2A) - A refined, sophisticated red for primary actions and branding
  - Secondary: Deep Crimson (#96151D) - For active states and hover effects
  - Accent: Soft Silver (#E2E8F0) - For secondary buttons and interactive elements
  - Background Primary: Darker Navy (#0A0E14) - Deep background inspired by logo backdrop
  - Background Secondary: Darker Slate Blue (#111722) - For cards and UI components
  - Background Tertiary: Darker Steel Blue (#1D2533) - For highlights and hover states
  - Text Primary: White (#FFFFFF) - For main text on dark backgrounds
  - Text Secondary: Platinum (#CBD5E0) - For secondary text
  - Success: Forest Green (#2F9E44) - Less bright, more sophisticated green
  - Warning: Amber Gold (#E6A817) - Warmer and more premium amber
  - Error: Ruby Red (#E03131) - For errors and failed transactions
  - Neutral: Slate Gray scale - For supporting elements and borders
  - Glass: rgba(17, 23, 34, 0.75) - For glass-like effects with transparency
  - GlassBorder: rgba(255, 255, 255, 0.08) - Subtle borders for glass components
  - Card Background: rgba(17, 23, 34, 0.6) - Semi-transparent background for cards
  - Progress Background: rgba(255, 255, 255, 0.05) - Subtle background for progress bars
  - Progress Fill: linear-gradient(90deg, #D81F2A, #96151D) - Gradient for progress indicators

- **Typography**:
  - Primary Font: Inter (sans-serif)
  - Headings: 700 weight, 1.2 line height
  - Body: 400 weight, 1.5 line height
  - Code: Fira Mono (monospace)

- **Spacing System**:
  - Base unit: 4px
  - Scale: 4px, 8px, 16px, 24px, 32px, 48px, 64px

- **Component States**:
  - Default, Hover, Active, Disabled
  - Loading (with skeleton loaders or spinners)
  - Error states with appropriate feedback

### 1.2. Responsive Design Approach

- **Breakpoints**:
  - Mobile: < 480px
  - Tablet: 480px - 768px
  - Desktop: > 768px

- **Mobile-First Design**:
  - Single-column layouts for small screens
  - Multi-column for larger screens
  - Touch-friendly controls (min 44px tap targets)
  - Collapsible navigation and filters

### 1.3. 2025 UI Design Trends for Web3

As we look ahead to 2025, several UI design trends are emerging that will significantly impact Web3 applications like StarkFlux. The following trends have been incorporated into the current implementation:

#### 1.3.1. Simplified Blockchain Interactions

- **Human-Readable Wallet Addresses**: Implemented shortened wallet addresses in the header with hover to view full address
- **Progressive Disclosure**: Layered complex blockchain concepts, revealing details only when needed
- **Contextual UI Elements**: Status badges that clearly indicate subscription status (active/inactive)
- **Visual Transaction Feedback**: Button animations and hover effects for interactive elements

#### 1.3.2. Microanimations for Feedback

- **Hover Effects**: All buttons and interactive elements have subtle hover states with elevation changes
- **Progress Indicators**: Subscription cards show visual progress bars for remaining time
- **Dynamic Backgrounds**: Subtle gradient and pattern effects in the app background
- **Ripple Effects**: Click animations that provide haptic-like visual feedback

#### 1.3.3. Modern Visual Language

- **3D Elements**: Subtle elevation and shadow effects for cards and components
- **Glassmorphism**: Semi-transparent UI elements with subtle borders
- **Gradient Accents**: Primary buttons and progress bars use red gradient effects
- **Grid Backgrounds**: Subtle grid patterns to provide depth and dimension
- **Abstract Shapes**: Large circular gradients in the background for visual interest

Implementing these 2025 trends will position StarkFlux at the cutting edge of Web3 UI design, making complex blockchain interactions intuitive while providing a visually engaging experience that meets the expectations of both crypto-native users and mainstream audiences.

## IMPORTANT: Dependency Management

### StarkNet Library Compatibility Issues

The StarkNet ecosystem has rapidly evolving libraries with specific compatibility requirements that can cause dependency conflicts when setting up a new project. Common issues include:

- Version conflicts between `starknet.js` (v5.x vs v6.x)
- Peer dependency requirements between `@starknet-react/core`, `get-starknet`, and `starknetkit`
- Breaking changes between major versions of these libraries

### Working Dependency Configuration

For a stable development experience, use these specific library versions that are known to work together:

```json
{
  "dependencies": {
    "@chakra-ui/react": "^2.8.2",
    "@emotion/react": "^11.11.3",
    "@emotion/styled": "^11.11.0",
    "@starknet-react/core": "1.0.4",
    "@tanstack/react-query": "^5.20.5",
    "get-starknet": "2.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.1",
    "starknet": "5.14.1"
  }
}
```

When installing these packages in PowerShell, use the `--legacy-peer-deps` flag:

```powershell
npm install @starknet-react/core@1.0.4 get-starknet@2.1.0 starknet@5.14.1 --legacy-peer-deps
```

For wallet connection, consider using a simpler approach with just `get-starknet` or a specific version of `starknetkit` if needed:

```powershell
npm install starknetkit@1.0.0 --legacy-peer-deps
```

### PowerShell Development Environment

When developing in a Windows PowerShell environment:

1. **Environment Variables**
   ```powershell
   # Setting environment variables
   $env:VITE_CONTRACT_ADDRESS = "0x0123..."
   
   # Creating a .env file for persistent variables
   @"
   VITE_COMPONENT_REGISTRY_ADDRESS="0x0030e23a1baf9b1bcd695e187bf8b7867c5017341bf871fbf623e4301c4c889a"
   VITE_IDENTITY_REGISTRY_ADDRESS="0x07438257cd32d2d858b9f7918de43942564f660880e09471906fe55855603cca"
   VITE_DEV_SUBSCRIPTION_ADDRESS="0x01fd15c8a66acd0451dce8cf4e1fba7c6028e3fa565525e0be0ec0224deb680a"
   VITE_MARKETPLACE_SUBSCRIPTION_ADDRESS="0x01fd9d8c71d4f990cad6047178f2703653dad24adb06ac504ff6ce326ce3f820"
   "@ | Out-File -FilePath .env.local -Encoding utf8
   ```

2. **Running Development Server**
   ```powershell
   # Start the development server
   npm run dev
   
   # Run in background (new PowerShell window)
   Start-Process npm -ArgumentList "run", "dev"
   ```

3. **Brave Browser Integration**
   ```powershell
   # Add to package.json scripts
   # "brave": "start \"\" \"C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe\" http://localhost:5173"
   
   # Run Brave with your app
   npm run brave
   ```

4. **PowerShell-Specific Considerations**
   - Use semicolons `;` to chain commands instead of `&&`
   - File paths use backslashes `\` (though forward slashes `/` often work too)
   - For complex npm commands, consider using PowerShell's `--% (stop parsing)` operator if special characters cause issues
   ```powershell
   npm --% run special:command --with=special@characters
   ```

5. **Troubleshooting Common Issues**
   - If npm installs fail with EACCES errors, run PowerShell as Administrator
   - If Brave browser path isn't found, check both Program Files locations:
     ```powershell
     # Check both common Brave installation locations
     Test-Path "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
     Test-Path "C:\Program Files (x86)\BraveSoftware\Brave-Browser\Application\brave.exe"
     ```
   - To kill a process using a port (e.g., if dev server won't start):
     ```powershell
     # Find and kill process using port 5173
     $processId = (Get-NetTCPConnection -LocalPort 5173).OwningProcess
     Stop-Process -Id $processId -Force
     ```

Always test contract interactions with a simple implementation first before building complex UI features.

## 2. Smart Contract-Driven UI Components

### 2.1. Wallet Connection

```jsx
const WalletConnectButton = () => {
  const { address, isConnected } = useAccount();
  
  const connectWallet = async () => {
    // Connection logic (see Contract Interaction Guide)
  };
  
  return (
    <Button 
      colorScheme="blue" 
      leftIcon={<WalletIcon />} 
      onClick={connectWallet}
    >
      {isConnected ? shortenAddress(address) : 'Connect Wallet'}
    </Button>
  );
};
```

**Implementation Notes**:
- Place prominently in header/navigation
- Show connection status clearly
- Display shortened wallet address when connected
- Provide disconnect option in dropdown menu
- Handle connection errors gracefully
- When testing with Brave browser on Windows, ensure StarkNet wallet extensions are properly installed

### 2.2. Component Card

```jsx
const ComponentCard = ({ component }) => {
  const { id, title, reference, seller, access_flags, price_strk, price_usd_micros, is_active } = component;
  
  // Access flags interpretation
  const isFree = !!(access_flags & 8);
  const supportsBuy = !!(access_flags & 1);
  const supportsDevSub = !!(access_flags & 2);
  const supportsMktSub = !!(access_flags & 4);
  
  return (
    <Card borderRadius="lg" boxShadow="md" overflow="hidden">
      <CardHeader>
        <Heading size="md">{title}</Heading>
        <AccessFlagsBadge 
          isFree={isFree}
          supportsBuy={supportsBuy}
          supportsDevSub={supportsDevSub}
          supportsMktSub={supportsMktSub}
        />
      </CardHeader>
      
      <CardBody>
        <DeveloperBadge sellerId={seller} />
        <PriceDisplay 
          priceStrk={price_strk} 
          priceUsdMicros={price_usd_micros} 
        />
      </CardBody>
      
      <CardFooter>
        <Button 
          colorScheme="blue" 
          isDisabled={!is_active}
          as={Link} 
          to={`/component/${id}`}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};
```

**Implementation Notes**:
- Use consistent sizing and spacing
- Include clear visual indicators for access flags
- Show price in STRK and USD equivalent
- Distinguish active vs. inactive components
- Make entire card clickable for better UX

### 2.3. Access Flag Badges

```jsx
const AccessFlagsBadge = ({ isFree, supportsBuy, supportsDevSub, supportsMktSub }) => {
  if (isFree) {
    return <Badge colorScheme="green">FREE</Badge>;
  }
  
  return (
    <HStack spacing={2}>
      {supportsBuy && <Badge colorScheme="blue">BUY</Badge>}
      {supportsDevSub && <Badge colorScheme="purple">DEV SUB</Badge>}
      {supportsMktSub && <Badge colorScheme="teal">MKT SUB</Badge>}
    </HStack>
  );
};
```

**Implementation Notes**:
- Use distinct colors for different access types
- Ensure badges are legible at small sizes
- Use consistent terminology across the application
- Add tooltips explaining each access type

### 2.4. Dynamic Price Display

```jsx
const PriceDisplay = ({ priceStrk, priceUsdMicros, priceFeedKey }) => {
  const isPricedInUsd = priceUsdMicros > 0;
  
  // For USD-priced components, get Oracle price
  const { data: oracleData, isLoading } = useOraclePrice(
    isPricedInUsd ? priceFeedKey : null
  );
  
  if (priceStrk > 0) {
    return (
      <HStack>
        <Text fontWeight="bold">{formatStrkAmount(priceStrk)}</Text>
        <Text>STRK</Text>
      </HStack>
    );
  }
  
  if (isPricedInUsd && isLoading) {
    return <Skeleton height="20px" width="100px" />;
  }
  
  if (isPricedInUsd && oracleData) {
    const strkEquivalent = calculateStrkFromUsd(priceUsdMicros, oracleData);
    
    return (
      <VStack align="flex-start" spacing={0}>
        <HStack>
          <Text fontWeight="bold">{formatUsdMicros(priceUsdMicros)}</Text>
          <Text>USD</Text>
        </HStack>
        <Text fontSize="xs" color="gray.500">
          ≈ {formatStrkAmount(strkEquivalent)} STRK
        </Text>
      </VStack>
    );
  }
  
  return <Text>Free</Text>;
};
```

**Implementation Notes**:
- Handle both STRK and USD pricing
- Show loading state during Oracle queries
- Display STRK equivalent for USD prices
- Format currency values consistently
- Handle edge cases (free components, missing Oracle data)

### 2.5. Purchase Button

```jsx
const PurchaseButton = ({ componentId, price }) => {
  const { writeContract, isPending, isSuccess, isError } = useWriteContract();
  
  const handlePurchase = async () => {
    // Purchase logic (see Contract Interaction Guide)
  };
  
  return (
    <VStack width="100%">
      <Button
        colorScheme="blue"
        width="100%"
        leftIcon={<ShoppingCartIcon />}
        onClick={handlePurchase}
        isLoading={isPending}
        loadingText="Processing"
      >
        Purchase for {formatPrice(price)} STRK
      </Button>
      
      {isSuccess && (
        <Alert status="success">
          <AlertIcon />
          Purchase successful!
        </Alert>
      )}
      
      {isError && (
        <Alert status="error">
          <AlertIcon />
          Purchase failed. Please try again.
        </Alert>
      )}
    </VStack>
  );
};
```

**Implementation Notes**:
- Show clear loading, success, and error states
- Display the price in the button
- Disable the button while transaction is pending
- Include transaction confirmations
- Provide recovery options for failed transactions

### 2.6. Subscription Status Card

```jsx
const SubscriptionStatus = ({ type, expiry, onRenew }) => {
  const now = Math.floor(Date.now() / 1000);
  const isActive = expiry > now;
  const daysRemaining = isActive ? Math.floor((expiry - now) / 86400) : 0;
  
  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      p={4}
      bg={isActive ? "green.50" : "gray.50"}
    >
      <Flex justify="space-between" align="center" mb={3}>
        <Heading size="sm">
          {type === 'marketplace' ? 'Marketplace' : 'Developer'} Subscription
        </Heading>
        <Badge colorScheme={isActive ? "green" : "gray"}>
          {isActive ? "Active" : "Expired"}
        </Badge>
      </Flex>
      
      {isActive ? (
        <>
          <Text>Expires: {new Date(expiry * 1000).toLocaleDateString()}</Text>
          <Progress 
            value={daysRemaining} 
            max={30} 
            colorScheme="green" 
            size="sm" 
            my={2} 
          />
          <Text fontSize="sm">{daysRemaining} days remaining</Text>
          
          {daysRemaining < 7 && (
            <Button 
              mt={3} 
              colorScheme="blue" 
              size="sm"
              onClick={onRenew}
            >
              Renew Subscription
            </Button>
          )}
        </>
      ) : (
        <Button 
          mt={3} 
          colorScheme="blue"
          onClick={onRenew}
        >
          Resubscribe
        </Button>
      )}
    </Box>
  );
};
```

**Implementation Notes**:
- Clearly indicate subscription status
- Show expiration date and time remaining
- Provide early renewal option when nearing expiration
- Use consistent visual language for subscription types
- Include subscription history and management options

### 2.7. Developer Identity Badge

```jsx
const DeveloperBadge = ({ developerId }) => {
  // Fetch developer details from IdentityRegistry
  const { data: identity, isLoading } = useDeveloperIdentity(developerId);
  
  if (isLoading) {
    return <Skeleton height="50px" width="200px" />;
  }
  
  if (!identity) {
    return null;
  }
  
  // Calculate reputation score (simplified)
  const reputation = calculateReputation(identity.upload_count, identity.total_sales_strk);
  
  return (
    <Flex align="center" gap={3}>
      <Avatar 
        size="md" 
        name={`Developer #${identity.id}`}
        src={`https://robohash.org/${identity.owner}?set=set3`}
      />
      <Box>
        <Text fontWeight="bold">Developer #{identity.id}</Text>
        <HStack fontSize="sm" color="gray.500">
          <StarIcon />
          <Text>{reputation} Reputation</Text>
          <Text>•</Text>
          <Text>{identity.upload_count} Uploads</Text>
        </HStack>
      </Box>
    </Flex>
  );
};
```

**Implementation Notes**:
- Generate consistent avatars based on address
- Show key metrics (reputation, uploads)
- Make developer profile linkable
- Handle loading and error states
- Ensure accessible color contrast

## 3. Page-Level User Interfaces

### 3.1. Component Marketplace Page

```jsx
const MarketplacePage = () => {
  const [filters, setFilters] = useState({
    accessType: 'all',
    priceMin: 0,
    priceMax: undefined,
    developerIds: [],
  });
  
  const { data: components, isLoading } = useComponents(filters);
  
  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Heading>Component Marketplace</Heading>
        <Box>
          <Link to="/upload">
            <Button colorScheme="blue" leftIcon={<UploadIcon />}>
              Upload Component
            </Button>
          </Link>
        </Box>
      </HStack>
      
      <Flex>
        {/* Filters Panel - Responsive */}
        <Box 
          display={{ base: 'none', md: 'block' }}
          width="250px"
          mr={8}
        >
          <FilterPanel 
            filters={filters} 
            onFilterChange={setFilters} 
          />
        </Box>
        
        {/* Mobile Filter Button */}
        <Button 
          display={{ base: 'block', md: 'none' }}
          mb={4}
          onClick={() => setShowMobileFilters(true)}
        >
          Filters
        </Button>
        
        {/* Components Grid */}
        <Box flex="1">
          {isLoading ? (
            <ComponentSkeleton count={6} />
          ) : (
            <SimpleGrid 
              columns={{ base: 1, sm: 2, lg: 3 }} 
              spacing={6}
            >
              {components.map(component => (
                <ComponentCard 
                  key={component.id} 
                  component={component} 
                />
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Flex>
    </Box>
  );
};
```

**Implementation Notes**:
- Implement responsive filtering with mobile consideration
- Use skeleton loaders during data fetching
- Adapt grid to different screen sizes
- Include empty states for no results
- Add pagination or infinite scrolling for large datasets

### 3.2. Component Detail Page

```jsx
const ComponentDetailPage = () => {
  const { componentId } = useParams();
  const { data: component, isLoading } = useComponent(componentId);
  const { account } = useAccount();
  
  // Check various access methods
  const { data: access } = useComponentAccess(componentId, account?.address);
  
  if (isLoading) {
    return <ComponentDetailSkeleton />;
  }
  
  if (!component) {
    return <NotFound message="Component not found" />;
  }
  
  return (
    <Box>
      <Breadcrumb mb={6}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/marketplace">Marketplace</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{component.title}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={8}>
        {/* Component Details */}
        <Box>
          <Heading mb={4}>{component.title}</Heading>
          <DeveloperBadge developerId={component.seller} mb={4} />
          <AccessFlagsBadge 
            isFree={!!(component.access_flags & 8)}
            supportsBuy={!!(component.access_flags & 1)}
            supportsDevSub={!!(component.access_flags & 2)}
            supportsMktSub={!!(component.access_flags & 4)}
            mb={4}
          />
          
          <Text fontSize="sm" color="gray.500" mb={6}>
            Registered on {new Date(component.registration_timestamp * 1000).toLocaleDateString()}
          </Text>
          
          <Heading size="md" mb={3}>Reference</Heading>
          <Code p={3} borderRadius="md" mb={6} width="100%">
            {component.reference}
          </Code>
        </Box>
        
        {/* Access Panel */}
        <Box 
          borderWidth="1px" 
          borderRadius="lg" 
          p={6}
          position="sticky"
          top="24px"
        >
          <Heading size="md" mb={4}>Access Options</Heading>
          
          <VStack spacing={4} align="stretch">
            {/* Show appropriate access options based on flags */}
            {access.hasAccess ? (
              <DownloadButton componentId={componentId} />
            ) : (
              <>
                {component.access_flags & 1 && (
                  <PurchaseButton 
                    componentId={componentId} 
                    price={component.price_strk} 
                  />
                )}
                
                {component.access_flags & 2 && (
                  <SubscribeDevButton 
                    developerId={component.seller_id} 
                  />
                )}
                
                {component.access_flags & 4 && (
                  <SubscribeMarketplaceButton />
                )}
                
                {component.access_flags & 8 && (
                  <DownloadButton componentId={componentId} />
                )}
              </>
            )}
          </VStack>
        </Box>
      </Grid>
    </Box>
  );
};
```

**Implementation Notes**:
- Sticky access panel for convenient interaction
- Responsive layout for different screen sizes
- Clear display of reference information
- Multiple access options based on component flags
- Breadcrumb navigation for context

### 3.3. Developer Dashboard

The Developer Dashboard has been implemented with a focus on subscription management and component tracking:

```jsx
const Dashboard = () => {
  // Implementation features:
  // - Subscription cards with status badges (Active/Inactive)
  // - Visual progress bars for subscription time remaining
  // - Empty state for components section
  // - Consistent styling with glassmorphism effects
  // - Micro-animations on button interactions
  // - Renewal/Subscribe buttons based on subscription status
  
  return (
    <div>
      <h1>Developer Dashboard</h1>
      
      {/* Subscriptions Section */}
      <div>
        <h2>Your Subscriptions</h2>
        <div>
          {/* Subscription cards with glassmorphism effects */}
          {/* Each card shows expiry date, progress bar, and action button */}
        </div>
      </div>
      
      {/* Components Section */}
      <div>
        <h2>Your Components</h2>
        <div>
          {/* Empty state with upload button */}
        </div>
      </div>
    </div>
  );
};
```

**Implementation Notes**:
- Cards use semi-transparent backgrounds with subtle borders
- Status badges change color based on active/inactive state
- Progress bars visualize remaining subscription time
- Buttons feature gradient backgrounds and hover animations
- Empty states provide clear calls to action
- Consistent visual language across all elements

## 4. Implementation Strategy

### 4.1. Minimum Viable Code Approach

For successful implementation of the StarkFlux UI, adopt the Minimum Viable Code approach:

1. **Start with core components first**
   - Build basic UI components without StarkNet integration
   - Test with mock data before connecting to contracts
   - Implement skeleton structure with working navigation

2. **Add StarkNet connectivity incrementally**
   - Begin with wallet connection only
   - Then add read-only contract interactions
   - Finally add write operations and transactions

3. **Test component by component**
   - Ensure each component works in isolation
   - Integrate components only after individual testing
   - Add detailed error handling progressively

4. **Follow a phased development approach**
   - Phase 1: Browse components (read-only)
   - Phase 2: Connect wallet and handle user state 
   - Phase 3: Add purchase and subscription functionality
   - Phase 4: Add developer dashboard and management tools

5. **Windows/PowerShell-Specific Workflow**
   - Use Visual Studio Code with PowerShell integrated terminal
   - Set up environment variables using PowerShell syntax
   - Configure Brave browser integration in package.json scripts
   ```json
   "scripts": {
     "dev": "vite",
     "build": "tsc && vite build",
     "preview": "vite preview",
     "brave": "start \"\" \"C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe\" http://localhost:5173"
   }
   ```
   - Handle file paths with appropriate Windows conventions
   - Log to PowerShell console for debugging: `Write-Host "Debug: $someVariable" -ForegroundColor Cyan`

This approach helps manage complexity and avoids dependency issues that can arise when trying to implement everything at once.

### 4.2. Brave Browser Integration for Windows

Brave browser provides excellent StarkNet wallet support. To optimize development with Brave on Windows:

1. **Installation Verification**
   ```powershell
   # Verify Brave installation path
   Test-Path "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
   ```

2. **Package.json Configuration**
   ```json
   "scripts": {
     "brave": "start \"\" \"C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe\" http://localhost:5173"
   }
   ```

3. **Wallet Extensions**
   - Install ArgentX and/or Braavos extensions in Brave
   - Configure StarkNet Sepolia testnet in wallet settings
   - Add test accounts for development

4. **Development Workflow**
   ```powershell
   # Terminal 1: Start dev server
   npm run dev
   
   # Terminal 2: Open in Brave
   npm run brave
   ```

5. **DevTools Configuration**
   - Open Brave DevTools (F12)
   - Dock to right for side-by-side development
   - Enable "Pause on caught exceptions" for better debugging
   - Use Network tab to monitor contract interactions

This setup provides an optimized environment for StarkNet frontend development on Windows.

## 5. Conclusion

This UI Development Guide provides a comprehensive overview of the visual components and user interfaces needed to effectively leverage the StarkFlux marketplace smart contracts. By following these guidelines, developers can create a user-friendly interface that properly integrates with the underlying blockchain functionality while providing a seamless user experience.

Remember that the StarkFlux UI must carefully coordinate between multiple contracts, particularly for the DevSubscription functionality which lacks a direct connection to the ComponentRegistry. Proper error handling, loading states, and transaction confirmations are essential for a robust implementation.

When developing on Windows with PowerShell, leverage the specific instructions in this guide to ensure a smooth development experience with the correct environment setup, dependency management, and Brave browser integration. 