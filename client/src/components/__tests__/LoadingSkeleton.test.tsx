/**
 * Loading Skeleton Tests
 * 
 * Test suite for LoadingSkeleton components
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Skeleton,
  Spinner,
  ButtonSpinner,
  CardSkeleton,
  TableRowSkeleton,
  ListItemSkeleton,
  IntegrationCardSkeleton,
  ChatMessageSkeleton,
  StatsCardSkeleton,
  PageLoadingSkeleton,
} from '../LoadingSkeleton';

describe('LoadingSkeleton Components', () => {
  describe('Skeleton', () => {
    it('renders with default props', () => {
      const { container } = render(<Skeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<Skeleton className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders as circle variant', () => {
      const { container } = render(<Skeleton variant="circle" />);
      expect(container.firstChild).toHaveClass('rounded-full');
    });
  });

  describe('Spinner', () => {
    it('renders spinner', () => {
      const { container } = render(<Spinner />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('applies custom size', () => {
      const { container } = render(<Spinner size="lg" />);
      expect(container.querySelector('svg')).toHaveClass('h-8', 'w-8');
    });
  });

  describe('ButtonSpinner', () => {
    it('renders button with spinner', () => {
      render(<ButtonSpinner>Loading...</ButtonSpinner>);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('CardSkeleton', () => {
    it('renders card skeleton structure', () => {
      const { container } = render(<CardSkeleton />);
      expect(container.querySelector('[class*="rounded-lg"]')).toBeInTheDocument();
    });
  });

  describe('TableRowSkeleton', () => {
    it('renders table row with specified columns', () => {
      const { container } = render(<TableRowSkeleton columns={3} />);
      const cells = container.querySelectorAll('td');
      expect(cells).toHaveLength(3);
    });
  });

  describe('IntegrationCardSkeleton', () => {
    it('renders integration card skeleton', () => {
      const { container } = render(<IntegrationCardSkeleton />);
      expect(container.querySelector('[class*="rounded-lg"]')).toBeInTheDocument();
    });
  });

  describe('PageLoadingSkeleton', () => {
    it('renders full page skeleton', () => {
      const { container } = render(<PageLoadingSkeleton />);
      expect(container.querySelector('[class*="space-y"]')).toBeInTheDocument();
    });
  });
});

