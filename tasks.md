# RoundCreated Event Subscription Implementation Tasks

## Overview
This document breaks down the implementation of RoundCreated event subscription and UI updates into small, testable tasks. Each task focuses on a single concern and has clear start and end points.

## Current State
- Dojo SDK is initialized in `ClientProvider`
- `createRound` system call is working
- `waiting-for-opponent.tsx` component exists
- Basic event listening is implemented but needs improvement

## Task Breakdown

### Task 1: Create Event Subscription Hook
**Goal**: Create a dedicated hook for RoundCreated events
```typescript
// Location: src/lib/dojo/hooks/useRoundEvents.ts
```
- [ ] Create new file `useRoundEvents.ts`
- [ ] Import necessary types from `@dojoengine/sdk`
- [ ] Create hook that returns subscription status and latest event
- [ ] Add TypeScript types for event data
- [ ] Test hook initialization

### Task 2: Implement Event Listener
**Goal**: Set up the event listener using Dojo SDK
```typescript
// Inside useRoundEvents.ts
```
- [ ] Import `useDojoSDK` hook
- [ ] Get client instance from SDK
- [ ] Set up event listener for "RoundCreated" event
- [ ] Implement cleanup function
- [ ] Test event listener setup

### Task 3: Create Event Data Transformer
**Goal**: Transform raw event data into usable format
```typescript
// Inside useRoundEvents.ts
```
- [ ] Create interface for transformed event data
- [ ] Implement transformation function
- [ ] Add validation for required fields
- [ ] Test data transformation

### Task 4: Update CreateChallenge Component
**Goal**: Integrate event subscription with component
```typescript
// Inside create-challenge.tsx
```
- [ ] Import useRoundEvents hook
- [ ] Add state for tracking subscription status
- [ ] Implement error handling
- [ ] Test component integration

### Task 5: Implement Round ID Extraction
**Goal**: Extract round_id from event data
```typescript
// Inside useRoundEvents.ts
```
- [ ] Add round_id extraction logic
- [ ] Implement validation for round_id
- [ ] Add error handling for missing data
- [ ] Test round_id extraction

### Task 6: Update WaitingForOpponent Component
**Goal**: Pass round_id to waiting component
```typescript
// Inside create-challenge.tsx
```
- [ ] Update modal payload structure
- [ ] Implement round_id passing
- [ ] Add loading state handling
- [ ] Test component communication

### Task 7: Add Error Boundaries
**Goal**: Implement error handling for event subscription
```typescript
// Inside useRoundEvents.ts
```
- [ ] Create error state management
- [ ] Implement error recovery
- [ ] Add error reporting
- [ ] Test error scenarios

### Task 8: Implement Cleanup
**Goal**: Ensure proper cleanup of subscriptions
```typescript
// Inside useRoundEvents.ts
```
- [ ] Add cleanup function
- [ ] Implement unsubscribe logic
- [ ] Add component unmount handling
- [ ] Test cleanup functionality

### Task 9: Add Loading States
**Goal**: Implement loading states for better UX
```typescript
// Inside create-challenge.tsx
```
- [ ] Add loading state management
- [ ] Implement loading UI
- [ ] Add transition states
- [ ] Test loading states

### Task 10: Implement Retry Logic
**Goal**: Add retry mechanism for failed subscriptions
```typescript
// Inside useRoundEvents.ts
```
- [ ] Add retry counter
- [ ] Implement retry logic
- [ ] Add max retry limit
- [ ] Test retry functionality

## Testing Checklist
For each task:
- [ ] Unit tests for the specific functionality
- [ ] Integration tests with related components
- [ ] Error case testing
- [ ] Edge case testing

## Implementation Notes
- Each task should be implemented and tested independently
- Use TypeScript for type safety
- Follow React best practices
- Maintain proper error handling
- Keep code modular and reusable

## Resources
- [Dojo SDK Documentation](https://book.dojoengine.org/)
- [Dojo.js Example Repository](https://github.com/dojoengine/dojo.js/tree/main/examples/example-vite-react-sdk)
- [Starknet Documentation](https://docs.starknet.io/)

# JoinRound Implementation Tasks

## Task 1: Setup JoinRound System Call
**Goal**: Create a system call function for joining rounds
- Create `joinRound` function in `useSystemCalls.ts`
- Add proper error handling and type definitions
- Include optimistic updates for UI feedback
- Add debug logging for transaction status

**Testing Checklist**:
- [ ] Function compiles without errors
- [ ] Proper type definitions are in place
- [ ] Error handling covers all cases
- [ ] Debug logs are informative

## Task 2: Create JoinRound Hook
**Goal**: Create a custom hook for managing join round operations
- Create `useJoinRound.ts` in `src/lib/dojo/hooks`
- Implement state management for join operation
- Add loading and error states
- Include retry logic for failed attempts

**Testing Checklist**:
- [ ] Hook compiles without errors
- [ ] State management works correctly
- [ ] Loading states update properly
- [ ] Error handling works as expected

## Task 3: Update ChallengeModal Component
**Goal**: Integrate join round functionality into the modal
- Add state management for join operation
- Implement form validation
- Add loading states during join operation
- Handle success/error cases

**Testing Checklist**:
- [ ] Form validation works
- [ ] Loading states display correctly
- [ ] Error messages are clear
- [ ] Success case handles properly

## Task 4: Add Round Validation
**Goal**: Validate round existence and status before joining
- Create validation function for round data
- Check round status (must be 'waiting')
- Verify player count hasn't reached limit
- Add proper error messages for each case

**Testing Checklist**:
- [ ] Validates round existence
- [ ] Checks round status correctly
- [ ] Verifies player count
- [ ] Shows appropriate error messages

## Task 5: Implement Round Data Subscription
**Goal**: Subscribe to round updates after joining
- Add subscription to round model updates
- Handle round status changes
- Update UI based on round state
- Implement cleanup on unmount

**Testing Checklist**:
- [ ] Subscribes to round updates
- [ ] Handles status changes
- [ ] Updates UI correctly
- [ ] Cleans up properly

## Task 6: Add Error Boundaries
**Goal**: Implement error handling for join operation
- Create error boundary component
- Add specific error messages for join failures
- Implement retry mechanism
- Add fallback UI for error states

**Testing Checklist**:
- [ ] Error boundary catches errors
- [ ] Error messages are clear
- [ ] Retry mechanism works
- [ ] Fallback UI displays correctly

## Task 7: Implement Loading States
**Goal**: Add comprehensive loading states
- Add loading spinner component
- Show loading state during join operation
- Add progress indicators
- Handle timeout cases

**Testing Checklist**:
- [ ] Loading spinner displays
- [ ] Progress indicators work
- [ ] Timeout handling works
- [ ] States transition smoothly

## Task 8: Add Success Flow
**Goal**: Handle successful join operation
- Implement success state
- Add transition to game screen
- Handle cleanup of modal
- Update global state

**Testing Checklist**:
- [ ] Success state displays
- [ ] Transitions work correctly
- [ ] Modal cleans up properly
- [ ] Global state updates

## Task 9: Add Cleanup Logic
**Goal**: Implement proper cleanup
- Add cleanup for subscriptions
- Clear timeouts and intervals
- Reset component state
- Handle unmounting

**Testing Checklist**:
- [ ] Subscriptions are cleaned up
- [ ] Timeouts are cleared
- [ ] State is reset
- [ ] Unmounting works properly

## Task 10: Add Analytics and Logging
**Goal**: Implement comprehensive logging
- Add debug logging for join operation
- Track success/failure rates
- Log round status changes
- Add performance metrics

**Testing Checklist**:
- [ ] Debug logs are informative
- [ ] Success/failure tracking works
- [ ] Status changes are logged
- [ ] Performance metrics are collected

## Resources
- Dojo SDK Documentation: [https://book.dojoengine.org/]
- Example Repository: [https://github.com/dojoengine/dojo-starter]
- React Best Practices: [https://react.dev/learn]

## Notes
- Each task should be completed and tested independently
- Follow React best practices for state management
- Maintain proper error handling throughout
- Keep UI/UX consistent with existing components
- Ensure proper cleanup in all cases
- Add appropriate logging for debugging

# Round ID Fix Tasks

## Overview
This section outlines the granular tasks needed to fix the round ID mismatch issue between the Torii server and frontend. Each task is small, testable, and focuses on a single concern.

## Task Breakdown

### Task 1: Add Debug Logging to Round ID Flow
**Goal**: Add comprehensive logging to track round ID at each step
```typescript
// Location: src/lib/dojo/hooks/useRoundEvents.ts
```
- [ ] Add console.log for raw roundData in processLatestEvent
- [ ] Add console.log for round_id extraction
- [ ] Add console.log for transformed event
- [ ] Test: Verify logs show complete round ID flow

### Task 2: Fix Round ID Extraction
**Goal**: Correctly extract round_id from event data
```typescript
// Location: src/lib/dojo/hooks/useRoundEvents.ts
```
- [ ] Add type check for roundData.round_id
- [ ] Add conversion to hex format if needed
- [ ] Add validation for round_id format
- [ ] Test: Verify extracted ID matches Torii server ID

### Task 3: Update Event Transformation
**Goal**: Ensure consistent round ID format in transformed event
```typescript
// Location: src/lib/dojo/hooks/useRoundEvents.ts
```
- [ ] Update transformEventData function to handle hex format
- [ ] Add validation for round_id in transformed event
- [ ] Add error handling for invalid formats
- [ ] Test: Verify transformed event has correct round ID

### Task 4: Update CreateChallenge Component
**Goal**: Ensure correct round ID is passed to waiting modal
```typescript
// Location: src/components/organisms/create-challange.tsx
```
- [ ] Add logging for latestEvent.round_id
- [ ] Add validation before passing to modal
- [ ] Add error handling for invalid IDs
- [ ] Test: Verify modal receives correct round ID

### Task 5: Update WaitingForOpponent Component
**Goal**: Ensure correct round ID handling in waiting component
```typescript
// Location: src/components/organisms/waiting-for-opponent.tsx
```
- [ ] Add logging for inviteCode
- [ ] Add validation for inviteCode format
- [ ] Add error handling for invalid codes
- [ ] Test: Verify component uses correct round ID

### Task 6: Add Round ID Validation
**Goal**: Add comprehensive validation for round IDs
```typescript
// Location: src/lib/dojo/utils/roundValidation.ts
```
- [ ] Add function to validate round ID format
- [ ] Add function to compare round IDs
- [ ] Add error messages for invalid formats
- [ ] Test: Verify validation catches mismatches

### Task 7: Update Round Subscription
**Goal**: Ensure round subscription uses correct ID
```typescript
// Location: src/lib/dojo/hooks/useRoundSubscription.ts
```
- [ ] Add logging for roundId conversion
- [ ] Add validation for roundId format
- [ ] Add error handling for invalid IDs
- [ ] Test: Verify subscription uses correct ID

### Task 8: Add Error Recovery
**Goal**: Add recovery mechanism for ID mismatches
```typescript
// Location: src/lib/dojo/hooks/useRoundEvents.ts
```
- [ ] Add retry logic for failed ID extraction
- [ ] Add fallback to alternative ID source
- [ ] Add error reporting
- [ ] Test: Verify recovery works

### Task 9: Update System Calls
**Goal**: Ensure system calls use correct round ID format
```typescript
// Location: src/lib/dojo/useSystemCalls.ts
```
- [ ] Add logging for round ID in createRound
- [ ] Add validation for round ID format
- [ ] Add error handling for invalid IDs
- [ ] Test: Verify system calls use correct format

### Task 10: Add Integration Tests
**Goal**: Add tests to verify round ID consistency
```typescript
// Location: src/lib/dojo/__tests__/roundId.test.ts
```
- [ ] Add test for round ID extraction
- [ ] Add test for round ID transformation
- [ ] Add test for round ID validation
- [ ] Test: Verify all round ID handling works

## Implementation Notes
- Each task should be implemented and tested independently
- After each task:
  1. Verify the changes work as expected
  2. Check the logs to ensure correct round ID flow
  3. Test the specific functionality
  4. Only proceed to the next task if current task is working
- Use TypeScript for type safety
- Follow React best practices
- Maintain proper error handling
- Keep code modular and reusable 

# Join Round Flow Improvements

## Overview
This section breaks down the improvements to the join round flow into small, testable tasks. Each task focuses on a single concern and has clear start and end points.

## Current State
- Basic join round functionality exists
- Race conditions in state updates
- Scattered error handling
- Complex state management
- Arbitrary delays for synchronization

## Task Breakdown

### Task 1: Add Debug Logging to Join Flow
**Goal**: Add comprehensive logging to track join round flow
```typescript
// Location: src/lib/dojo/hooks/useJoinRound.ts
```
- [ ] Add logging for round ID validation
- [ ] Add logging for round state checks
- [ ] Add logging for transaction execution
- [ ] Add logging for state updates
- [ ] Test logging in different scenarios

### Task 2: Fix Round ID Validation
**Goal**: Improve round ID validation and conversion
```typescript
// Location: src/lib/dojo/utils/roundValidation.ts
```
- [ ] Add hex format validation
- [ ] Add decimal format validation
- [ ] Add length validation
- [ ] Add conversion utilities
- [ ] Test all validation cases

### Task 3: Update Event Transformation
**Goal**: Ensure consistent round ID format in events
```typescript
// Location: src/lib/dojo/hooks/useRoundEvents.ts
```
- [ ] Add round ID format check
- [ ] Add conversion to hex format
- [ ] Add validation for event data
- [ ] Add error handling for invalid data
- [ ] Test event transformation

### Task 4: Update CreateChallenge Component
**Goal**: Ensure correct round ID passing to waiting modal
```typescript
// Location: src/components/organisms/create-challenge.tsx
```
- [ ] Add round ID format check
- [ ] Update modal payload structure
- [ ] Add validation before passing
- [ ] Add error handling
- [ ] Test round ID passing

### Task 5: Update WaitingForOpponent Component
**Goal**: Ensure correct handling of round ID in waiting component
```typescript
// Location: src/components/organisms/waiting-for-opponent.tsx
```
- [ ] Add round ID format check
- [ ] Update round data fetching
- [ ] Add validation for round data
- [ ] Add error handling
- [ ] Test round ID handling

### Task 6: Add Round ID Validation
**Goal**: Implement comprehensive validation for round IDs
```typescript
// Location: src/lib/dojo/utils/roundValidation.ts
```
- [ ] Add format validation
- [ ] Add existence check
- [ ] Add state validation
- [ ] Add error messages
- [ ] Test validation logic

### Task 7: Update Round Subscription
**Goal**: Ensure round subscription uses correct ID
```typescript
// Location: src/lib/dojo/hooks/useRoundSubscription.ts
```
- [ ] Add ID format check
- [ ] Update subscription logic
- [ ] Add error handling
- [ ] Add cleanup
- [ ] Test subscription

### Task 8: Add Error Recovery
**Goal**: Implement recovery mechanism for ID mismatches
```typescript
// Location: src/lib/dojo/hooks/useJoinRound.ts
```
- [ ] Add ID mismatch detection
- [ ] Add recovery logic
- [ ] Add user feedback
- [ ] Add logging
- [ ] Test recovery

### Task 9: Update System Calls
**Goal**: Ensure system calls use correct round ID format
```typescript
// Location: src/lib/dojo/useSystemCalls.ts
```
- [ ] Add ID format check
- [ ] Update call parameters
- [ ] Add error handling
- [ ] Add logging
- [ ] Test system calls

### Task 10: Add Integration Tests
**Goal**: Create tests to verify round ID consistency
```typescript
// Location: src/lib/dojo/__tests__/roundId.test.ts
```
- [ ] Add format tests
- [ ] Add conversion tests
- [ ] Add validation tests
- [ ] Add integration tests
- [ ] Test all scenarios

## Testing Checklist
For each task:
- [ ] Unit tests for the specific functionality
- [ ] Integration tests with related components
- [ ] Error case testing
- [ ] Edge case testing

## Implementation Notes
- Each task should be implemented and tested independently
- Use TypeScript for type safety
- Follow React best practices
- Maintain proper error handling
- Keep code modular and reusable

## Resources
- [Dojo SDK Documentation](https://book.dojoengine.org/)
- [Dojo.js Example Repository](https://github.com/dojoengine/dojo.js/tree/main/examples/example-vite-react-sdk)
- [Starknet Documentation](https://docs.starknet.io/)

## Notes
- Each task should be completed and tested independently
- Follow React best practices for state management
- Maintain proper error handling throughout
- Keep UI/UX consistent with existing components
- Ensure proper cleanup in all cases
- Add appropriate logging for debugging

# Event-Driven Architecture Implementation Tasks

## Phase 1: Core Event System Setup

### Task 1: Event Types Definition
**Start**: Create new file `src/lib/dojo/events/types.ts`
**End**: File created with all event types and interfaces
**Focus**: Define the event system's type structure
```typescript
// Define RoundEventType enum
// Define RoundEvent interface
// Define RoundState interface
// Define PlayerEvent interface
```

### Task 2: Event Bus Implementation
**Start**: Create new file `src/lib/dojo/events/eventBus.ts`
**End**: Event bus singleton with basic emit/listen functionality
**Focus**: Implement the core event bus system
```typescript
// Implement RoundEventBus class
// Add singleton pattern
// Add basic emit/listen methods
// Add type safety
```

### Task 3: Round State Store
**Start**: Create new file `src/lib/dojo/store/roundStore.ts`
**End**: Zustand store with round state management
**Focus**: Centralized state management for rounds
```typescript
// Implement useRoundStore
// Add round CRUD operations
// Add player management
// Add current round tracking
```

## Phase 2: Event Handlers and Hooks

### Task 4: Round Event Hook
**Start**: Create new file `src/lib/dojo/hooks/useRoundEvents.ts`
**End**: Hook that subscribes to round events
**Focus**: Event subscription and state updates
```typescript
// Implement useRoundEvents hook
// Add event handlers
// Connect to roundStore
// Add cleanup
```

### Task 5: Player Event Hook
**Start**: Create new file `src/lib/dojo/hooks/usePlayerEvents.ts`
**End**: Hook that manages player-related events
**Focus**: Player state and event handling
```typescript
// Implement usePlayerEvents hook
// Add player join/leave handlers
// Connect to roundStore
// Add cleanup
```

## Phase 3: Component Refactoring

### Task 6: CreateChallenge Component
**Start**: Modify `src/components/organisms/create-challange.tsx`
**End**: Component using event system
**Focus**: Convert to event-driven round creation
```typescript
// Remove direct state management
// Add event emission
// Update UI to use roundStore
// Add error handling
```

### Task 7: WaitingForOpponent Component
**Start**: Modify `src/components/organisms/waiting-for-opponent.tsx`
**End**: Component using event system
**Focus**: Convert to event-driven round monitoring
```typescript
// Remove useModels dependency
// Add event subscription
// Update UI to use roundStore
// Add loading states
```

### Task 8: ChallengeModal Component
**Start**: Modify `src/components/organisms/challengeModal.tsx`
**End**: Component using event system
**Focus**: Convert to event-driven round joining
```typescript
// Remove direct state management
// Add event emission for joins
// Update UI to use roundStore
// Add error handling
```

## Phase 4: Integration and Testing

### Task 9: Provider Integration
**Start**: Modify `src/lib/dojo/DojoProvider.tsx`
**End**: Provider with event system initialization
**Focus**: Initialize event system at app root
```typescript
// Add event bus initialization
// Add store initialization
// Add cleanup
```

### Task 10: Event System Testing
**Start**: Create new file `src/lib/dojo/events/__tests__/eventBus.test.ts`
**End**: Comprehensive test suite
**Focus**: Test event system functionality
```typescript
// Test event emission
// Test event handling
// Test state updates
// Test cleanup
```

### Task 11: Store Testing
**Start**: Create new file `src/lib/dojo/store/__tests__/roundStore.test.ts`
**End**: Comprehensive test suite
**Focus**: Test state management
```typescript
// Test round operations
// Test player operations
// Test state updates
// Test edge cases
```

## Phase 5: Cleanup and Optimization

### Task 12: Remove Legacy Code
**Start**: Review all modified files
**End**: Remove unused code and dependencies
**Focus**: Clean up old implementation
```typescript
// Remove unused imports
// Remove unused state
// Remove unused effects
// Update documentation
```

### Task 13: Performance Optimization
**Start**: Review event system implementation
**End**: Optimized event handling
**Focus**: Improve performance
```typescript
// Add event debouncing
// Optimize state updates
// Add memoization
// Add performance monitoring
```

### Task 14: Documentation
**Start**: Create new file `src/lib/dojo/events/README.md`
**End**: Complete documentation
**Focus**: Document the event system
```markdown
# Event System Documentation
- Architecture overview
- Event types
- Usage examples
- Best practices
```

## Testing Strategy

For each task:
1. Create a new branch
2. Implement the task
3. Add tests
4. Create PR
5. Test in isolation
6. Merge to main
7. Test integration

## Rollback Plan

For each phase:
1. Keep old implementation in separate branch
2. Add feature flags
3. Monitor error rates
4. Have rollback scripts ready

## Success Criteria

- All tests passing
- No console errors
- No performance regression
- All components working as before
- Event system properly handling all cases
- Clean codebase with no legacy code
- Complete documentation

# JoinRound Implementation Tasks

## Task 1: Setup JoinRound System Call
**Goal**: Create a system call function for joining rounds
- Create `joinRound` function in `useSystemCalls.ts`
- Add proper error handling and type definitions
- Include optimistic updates for UI feedback
- Add debug logging for transaction status

**Testing Checklist**:
- [ ] Function compiles without errors
- [ ] Proper type definitions are in place
- [ ] Error handling covers all cases
- [ ] Debug logs are informative

## Task 2: Create JoinRound Hook
**Goal**: Create a custom hook for managing join round operations
- Create `useJoinRound.ts` in `src/lib/dojo/hooks`
- Implement state management for join operation
- Add loading and error states
- Include retry logic for failed attempts

**Testing Checklist**:
- [ ] Hook compiles without errors
- [ ] State management works correctly
- [ ] Loading states update properly
- [ ] Error handling works as expected

## Task 3: Update ChallengeModal Component
**Goal**: Integrate join round functionality into the modal
- Add state management for join operation
- Implement form validation
- Add loading states during join operation
- Handle success/error cases

**Testing Checklist**:
- [ ] Form validation works
- [ ] Loading states display correctly
- [ ] Error messages are clear
- [ ] Success case handles properly

## Task 4: Add Round Validation
**Goal**: Validate round existence and status before joining
- Create validation function for round data
- Check round status (must be 'waiting')
- Verify player count hasn't reached limit
- Add proper error messages for each case

**Testing Checklist**:
- [ ] Validates round existence
- [ ] Checks round status correctly
- [ ] Verifies player count
- [ ] Shows appropriate error messages

## Task 5: Implement Round Data Subscription
**Goal**: Subscribe to round updates after joining
- Add subscription to round model updates
- Handle round status changes
- Update UI based on round state
- Implement cleanup on unmount

**Testing Checklist**:
- [ ] Subscribes to round updates
- [ ] Handles status changes
- [ ] Updates UI correctly
- [ ] Cleans up properly

## Task 6: Add Error Boundaries
**Goal**: Implement error handling for join operation
- Create error boundary component
- Add specific error messages for join failures
- Implement retry mechanism
- Add fallback UI for error states

**Testing Checklist**:
- [ ] Error boundary catches errors
- [ ] Error messages are clear
- [ ] Retry mechanism works
- [ ] Fallback UI displays correctly

## Task 7: Implement Loading States
**Goal**: Add comprehensive loading states
- Add loading spinner component
- Show loading state during join operation
- Add progress indicators
- Handle timeout cases

**Testing Checklist**:
- [ ] Loading spinner displays
- [ ] Progress indicators work
- [ ] Timeout handling works
- [ ] States transition smoothly

## Task 8: Add Success Flow
**Goal**: Handle successful join operation
- Implement success state
- Add transition to game screen
- Handle cleanup of modal
- Update global state

**Testing Checklist**:
- [ ] Success state displays
- [ ] Transitions work correctly
- [ ] Modal cleans up properly
- [ ] Global state updates

## Task 9: Add Cleanup Logic
**Goal**: Implement proper cleanup
- Add cleanup for subscriptions
- Clear timeouts and intervals
- Reset component state
- Handle unmounting

**Testing Checklist**:
- [ ] Subscriptions are cleaned up
- [ ] Timeouts are cleared
- [ ] State is reset
- [ ] Unmounting works properly

## Task 10: Add Analytics and Logging
**Goal**: Implement comprehensive logging
- Add debug logging for join operation
- Track success/failure rates
- Log round status changes
- Add performance metrics

**Testing Checklist**:
- [ ] Debug logs are informative
- [ ] Success/failure tracking works
- [ ] Status changes are logged
- [ ] Performance metrics are collected

## Resources
- Dojo SDK Documentation: [https://book.dojoengine.org/]
- Example Repository: [https://github.com/dojoengine/dojo-starter]
- React Best Practices: [https://react.dev/learn]

## Notes
- Each task should be completed and tested independently
- Follow React best practices for state management
- Maintain proper error handling throughout
- Keep UI/UX consistent with existing components
- Ensure proper cleanup in all cases
- Add appropriate logging for debugging

# Round ID Fix Tasks

## Overview
This section outlines the granular tasks needed to fix the round ID mismatch issue between the Torii server and frontend. Each task is small, testable, and focuses on a single concern.

## Task Breakdown

### Task 1: Add Debug Logging to Round ID Flow
**Goal**: Add comprehensive logging to track round ID at each step
```typescript
// Location: src/lib/dojo/hooks/useRoundEvents.ts
```
- [ ] Add console.log for raw roundData in processLatestEvent
- [ ] Add console.log for round_id extraction
- [ ] Add console.log for transformed event
- [ ] Test: Verify logs show complete round ID flow

### Task 2: Fix Round ID Extraction
**Goal**: Correctly extract round_id from event data
```typescript
// Location: src/lib/dojo/hooks/useRoundEvents.ts
```
- [ ] Add type check for roundData.round_id
- [ ] Add conversion to hex format if needed
- [ ] Add validation for round_id format
- [ ] Test: Verify extracted ID matches Torii server ID

### Task 3: Update Event Transformation
**Goal**: Ensure consistent round ID format in transformed event
```typescript
// Location: src/lib/dojo/hooks/useRoundEvents.ts
```
- [ ] Update transformEventData function to handle hex format
- [ ] Add validation for round_id in transformed event
- [ ] Add error handling for invalid formats
- [ ] Test: Verify transformed event has correct round ID

### Task 4: Update CreateChallenge Component
**Goal**: Ensure correct round ID is passed to waiting modal
```typescript
// Location: src/components/organisms/create-challange.tsx
```
- [ ] Add logging for latestEvent.round_id
- [ ] Add validation before passing to modal
- [ ] Add error handling for invalid IDs
- [ ] Test: Verify modal receives correct round ID

### Task 5: Update WaitingForOpponent Component
**Goal**: Ensure correct round ID handling in waiting component
```typescript
// Location: src/components/organisms/waiting-for-opponent.tsx
```
- [ ] Add logging for inviteCode
- [ ] Add validation for inviteCode format
- [ ] Add error handling for invalid codes
- [ ] Test: Verify component uses correct round ID

### Task 6: Add Round ID Validation
**Goal**: Add comprehensive validation for round IDs
```typescript
// Location: src/lib/dojo/utils/roundValidation.ts
```
- [ ] Add function to validate round ID format
- [ ] Add function to compare round IDs
- [ ] Add error messages for invalid formats
- [ ] Test: Verify validation catches mismatches

### Task 7: Update Round Subscription
**Goal**: Ensure round subscription uses correct ID
```typescript
// Location: src/lib/dojo/hooks/useRoundSubscription.ts
```
- [ ] Add logging for roundId conversion
- [ ] Add validation for roundId format
- [ ] Add error handling for invalid IDs
- [ ] Test: Verify subscription uses correct ID

### Task 8: Add Error Recovery
**Goal**: Add recovery mechanism for ID mismatches
```typescript
// Location: src/lib/dojo/hooks/useRoundEvents.ts
```
- [ ] Add retry logic for failed ID extraction
- [ ] Add fallback to alternative ID source
- [ ] Add error reporting
- [ ] Test: Verify recovery works

### Task 9: Update System Calls
**Goal**: Ensure system calls use correct round ID format
```typescript
// Location: src/lib/dojo/useSystemCalls.ts
```
- [ ] Add logging for round ID in createRound
- [ ] Add validation for round ID format
- [ ] Add error handling for invalid IDs
- [ ] Test: Verify system calls use correct format

### Task 10: Add Integration Tests
**Goal**: Add tests to verify round ID consistency
```typescript
// Location: src/lib/dojo/__tests__/roundId.test.ts
```
- [ ] Add test for round ID extraction
- [ ] Add test for round ID transformation
- [ ] Add test for round ID validation
- [ ] Test: Verify all round ID handling works

## Implementation Notes
- Each task should be implemented and tested independently
- After each task:
  1. Verify the changes work as expected
  2. Check the logs to ensure correct round ID flow
  3. Test the specific functionality
  4. Only proceed to the next task if current task is working
- Use TypeScript for type safety
- Follow React best practices
- Maintain proper error handling
- Keep code modular and reusable 

# Join Round Flow Improvements

## Overview
This section breaks down the improvements to the join round flow into small, testable tasks. Each task focuses on a single concern and has clear start and end points.

## Current State
- Basic join round functionality exists
- Race conditions in state updates
- Scattered error handling
- Complex state management
- Arbitrary delays for synchronization

## Task Breakdown

### Task 1: Add Debug Logging to Join Flow
**Goal**: Add comprehensive logging to track join round flow
```typescript
// Location: src/lib/dojo/hooks/useJoinRound.ts
```
- [ ] Add logging for round ID validation
- [ ] Add logging for round state checks
- [ ] Add logging for transaction execution
- [ ] Add logging for state updates
- [ ] Test logging in different scenarios

### Task 2: Fix Round ID Validation
**Goal**: Improve round ID validation and conversion
```typescript
// Location: src/lib/dojo/utils/roundValidation.ts
```
- [ ] Add hex format validation
- [ ] Add decimal format validation
- [ ] Add length validation
- [ ] Add conversion utilities
- [ ] Test all validation cases

### Task 3: Update Event Transformation
**Goal**: Ensure consistent round ID format in events
```typescript
// Location: src/lib/dojo/hooks/useRoundEvents.ts
```
- [ ] Add round ID format check
- [ ] Add conversion to hex format
- [ ] Add validation for event data
- [ ] Add error handling for invalid data
- [ ] Test event transformation

### Task 4: Update CreateChallenge Component
**Goal**: Ensure correct round ID passing to waiting modal
```typescript
// Location: src/components/organisms/create-challenge.tsx
```
- [ ] Add round ID format check
- [ ] Update modal payload structure
- [ ] Add validation before passing
- [ ] Add error handling
- [ ] Test round ID passing

### Task 5: Update WaitingForOpponent Component
**Goal**: Ensure correct handling of round ID in waiting component
```typescript
// Location: src/components/organisms/waiting-for-opponent.tsx
```
- [ ] Add round ID format check
- [ ] Update round data fetching
- [ ] Add validation for round data
- [ ] Add error handling
- [ ] Test round ID handling

### Task 6: Add Round ID Validation
**Goal**: Implement comprehensive validation for round IDs
```typescript
// Location: src/lib/dojo/utils/roundValidation.ts
```
- [ ] Add format validation
- [ ] Add existence check
- [ ] Add state validation
- [ ] Add error messages
- [ ] Test validation logic

### Task 7: Update Round Subscription
**Goal**: Ensure round subscription uses correct ID
```typescript
// Location: src/lib/dojo/hooks/useRoundSubscription.ts
```
- [ ] Add ID format check
- [ ] Update subscription logic
- [ ] Add error handling
- [ ] Add cleanup
- [ ] Test subscription

### Task 8: Add Error Recovery
**Goal**: Implement recovery mechanism for ID mismatches
```typescript
// Location: src/lib/dojo/hooks/useJoinRound.ts
```
- [ ] Add ID mismatch detection
- [ ] Add recovery logic
- [ ] Add user feedback
- [ ] Add logging
- [ ] Test recovery

### Task 9: Update System Calls
**Goal**: Ensure system calls use correct round ID format
```typescript
// Location: src/lib/dojo/useSystemCalls.ts
```
- [ ] Add ID format check
- [ ] Update call parameters
- [ ] Add error handling
- [ ] Add logging
- [ ] Test system calls

### Task 10: Add Integration Tests
**Goal**: Create tests to verify round ID consistency
```typescript
// Location: src/lib/dojo/__tests__/roundId.test.ts
```
- [ ] Add format tests
- [ ] Add conversion tests
- [ ] Add validation tests
- [ ] Add integration tests
- [ ] Test all scenarios

## Testing Checklist
For each task:
- [ ] Unit tests for the specific functionality
- [ ] Integration tests with related components
- [ ] Error case testing
- [ ] Edge case testing

## Implementation Notes
- Each task should be implemented and tested independently
- Use TypeScript for type safety
- Follow React best practices
- Maintain proper error handling
- Keep code modular and reusable

## Resources
- [Dojo SDK Documentation](https://book.dojoengine.org/)
- [Dojo.js Example Repository](https://github.com/dojoengine/dojo.js/tree/main/examples/example-vite-react-sdk)
- [Starknet Documentation](https://docs.starknet.io/) 