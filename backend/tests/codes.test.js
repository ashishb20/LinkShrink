import { describe, it, expect } from 'vitest';
import { parseCodes } from '../src/controllers/url.controller.js';

describe('parseCodes', () => {
    it('keeps valid unique 7-character codes', () => {
        expect(parseCodes('aaaaaaa, bbbbbbb,aaaaaaa,bad,ccccccc')).toEqual([
            'aaaaaaa',
            'bbbbbbb',
            'ccccccc',
        ]);
    });

    it('ignores empty and missing input', () => {
        expect(parseCodes('')).toEqual([]);
        expect(parseCodes(undefined)).toEqual([]);
    });

    it('caps the list at 200 codes', () => {
        const codes = Array.from({ length: 250 }, (_, index) =>
            String(index).padStart(7, '0'),
        );
        expect(parseCodes(codes.join(','))).toHaveLength(200);
    });
});
