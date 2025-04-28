// src/__tests__/alias.test.ts
import { render } from '@testing-library/react';
import GameComponent from "@/components/GameComponent";
import React from 'react';

// Mock the Dojo hooks
jest.mock('@/lib/dojo/hooks/useDojo', () => ({
  useDojo: () => ({
    account: null,
    systemCalls: {},
    execute: jest.fn(),
    world: {},
  })
}));

describe('GameComponent', () => {
  test("GameComponent should be imported correctly", () => {
    expect(GameComponent).toBeDefined();
  });

  test("GameComponent should render without crashing", () => {
    const { container } = render(React.createElement(GameComponent));
    expect(container).toBeTruthy();
  });
});