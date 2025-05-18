// Adds custom jest-dom matchers (like toBeInTheDocument)
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock global `URL` object with `createObjectURL` and `revokeObjectURL`
vi.stubGlobal('URL', {
    createObjectURL: vi.fn().mockReturnValue('blob:url'),
    revokeObjectURL: vi.fn().mockImplementation(() => { }),
});

// Optionally mock matchMedia for components that depend on it (like responsive UIs)
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }),
});

// Optional: reset all mocks between tests
afterEach(() => {
    cleanup(); // clean up the DOM
});
