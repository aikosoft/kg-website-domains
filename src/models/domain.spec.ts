import { Domain } from './domain';

describe('Domain', () => {
    it('should be defined', () => {
        expect(new Domain( 1, 'test')).toBeDefined();
    });

    it('should set rank', () => {
        const domain = new Domain(12, 'test.kg');
        expect(domain).toBeDefined();
        expect(domain.rank).toEqual(12);
        expect(domain.link).toEqual('test.kg');
    });
});
