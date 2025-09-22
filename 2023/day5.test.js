import { beforeEach, describe, expect, test } from 'vitest';
import { Part1Solution, Part2Solution, Transformer, RangeOfInterest } from './day5.context.mjs';

describe('RangeOfInterest tests', () => {
    describe('isTouching tests', () => {
        test.each([
            [-1, 1], 
            [12, 15]
        ])('Disjoint range returns false', (start, end) => {
            const roi = new RangeOfInterest();
            roi.addRange(5, 10);
            expect(roi.isTouching({start, end})).toBe(false);
        });

        test.each([
            [1, 4],
            [11, 15]
        ])('Touching range returns true', (start, end) => {
            // Arrange
            const roi = new RangeOfInterest();
            roi.addRange(5, 10);

            // Act & Assert
            expect(roi.isTouching({start, end})).toBe(true);
        });

        test.each([
            [3, 7],
            [8, 15],
            [6, 9],
            [5, 10],
            [4, 11]
        ])('Overlapping or embedded range returns false', (start, end) => {
            const roi = new RangeOfInterest();
            roi.addRange(5, 10);
            expect(roi.isTouching({start, end})).toBe(false);
        });
    });

    describe('isOverlapping tests', () => {
        test.each([
            [-1, 1], 
            [12, 15]
        ])('Disjoint range returns false', (start, end) => {
            // Arrange
            const roi = new RangeOfInterest();
            roi.addRange(5, 10);

            // Act and assert
            expect(roi.isOverlapping({start, end})).toBe(false);
        });

        test.each([
            [1, 4],
            [11, 15]
        ])('Touching range returns false', (start, end) => {
            // Arrange
            const roi = new RangeOfInterest();
            roi.addRange(5, 10);

            // Act & Assert
            expect(roi.isOverlapping({start, end})).toBe(false);
        });

        test.each([
            [3, 7],
            [8, 15],
            [3, 5],
            [10, 12],
            [6, 9],
            [4, 11],
            [5, 10]
        ])('Overlapping or embedded range [%d, %d] returns true', (start, end) => {
            const roi = new RangeOfInterest();
            roi.addRange(5, 10);
            expect(roi.isOverlapping({start, end})).toBe(true);
        });
    });

    describe('AddRange keeps ranges canonical', () => {
        test('AddRange throws exception if range swapped', () => {        
            const roi = new RangeOfInterest();

            // Act & Assert
            expect(() => roi.addRange(10, 5)).toThrow();
        });

        test('AddRange adds multiple disjoint ranges', () => {
            const roi = new RangeOfInterest();
            roi.addRange(5, 10);
            roi.addRange(15, 20);
            expect(roi.ranges).toHaveLength(2);
        });
    });

    describe('RangeOfInterest subranges tests', () => {
        function setupROI() {
            const roi = new RangeOfInterest();
            roi.addRange(5, 10);
            return roi;
        }

        test('Subranges of empty ROI is empty', () => {
            const roi = new RangeOfInterest();
            const result = roi.subranges([{start: 1, end: 10}]);
            expect(result).toHaveLength(0);
        });

        test('No ranges returns ROI', () => {
            // Arrange
            const roi = setupROI();

            const result = roi.subranges([]);
            expect(result).toHaveLength(1);
            expect(result).toContainEqual({start: 5, end: 10});
        });

        test('Disjoint range returns ROI', () => {
            // [*]
            //      [-]
            // [*]
            // Arrange
            const roi = setupROI();

            const result = roi.subranges([{start: 1, end: 4}]);
            expect(result).toHaveLength(1);
            expect(result).toContainEqual({start: 5, end: 10});
        });

        test('Trailing range creates a lead in range', () => {
            // [*****]
            //    [--]
            // [*][**]
            // Arrange
            const roi = setupROI();

            // Act
            const result = roi.subranges([{start: 8, end: 10}])

            // Assert
            expect(result).toHaveLength(2);
            expect(result).toContainEqual({start: 5, end: 7});
            expect(result).toContainEqual({start: 8, end: 10});
        })

        test('Leading range creates a trailing range', () => {
            //  [*****]
            //  [-]
            //  [*][**]
            // Arrange
            const roi = setupROI();

            // Act
            const result = roi.subranges([{ start: 5, end: 6 }]);

            // Assert
            expect(result).toHaveLength(2);
            expect(result).toContainEqual({ start: 5, end: 6 });
            expect(result).toContainEqual({ start: 7, end: 10 });
        });

        test('Strictly embedded range splits ROI in three', () => {
            // [*******]
            //    [-]
            // [*][*][*]            
            // Arrange
            const roi = setupROI();

            //act 
            const result = roi.subranges([{ start: 6, end: 7 }]);

            // assert
            expect(result).toHaveLength(3);
            expect(result).toContainEqual({start: 5, end: 5});
            expect(result).toContainEqual({start: 6, end: 7});
            expect(result).toContainEqual({start: 8, end: 10});
        })

        test('Range spanning split ROI creates ranges in both ROI parts', () => {
            // [****] [*****]
            //    [-----]
            // [*][*] [*][**]
            // Arrange
            const roi = setupROI();
            roi.addRange(15, 20);

            // Act
            const result = roi.subranges([{ start: 8, end: 17 }]);

            // Assert
            expect(result).toHaveLength(4);
            expect(result).toContainEqual({ start: 8, end: 10 });
            expect(result).toContainEqual({ start: 15, end: 17 });
        });

        test('Gaps in ranges are filled in', () => {
            // [*********]
            // [--]   [--]
            // [**][**][*]
            // Arrange
            const roi = setupROI();

            // Act
            const result = roi.subranges([{ start: 5, end: 6 }, { start: 9, end: 10 }]);

            // Assert
            expect(result).toHaveLength(3);
            expect(result).toContainEqual({ start: 5, end: 6 });
            expect(result).toContainEqual({ start: 7, end: 8 });
            expect(result).toContainEqual({ start: 9, end: 10 });
        });

        test('Handles the example correctly', () => {
            /* ROI:   [************] [*****] [****]  [*]  [*]
            *  Rng: [----][--]   [-----][--] [-]    [---]
            *         [==][==][=][=] [=][==] [=][=]  [=]  [=]
            */

            // Arrange
            const roi = new RangeOfInterest();
            roi.addRange(2, 15);
            roi.addRange(17, 23);
            roi.addRange(25, 30);
            roi.addRange(33, 35);
            roi.addRange(38, 40);

            // Act
            const result = roi.subranges([
                { start: 0, end: 5 },   // Leading part outside ROI
                { start: 6, end: 9 },   // Fully embedded
                { start: 13, end: 19 }, // Spanning two ROI parts
                { start: 20, end: 23 }, // Fully embedded, touching previous and end
                { start: 25, end: 27 }, // Fully embedded, touching start
                { start: 32, end: 36 }  // Overlapping start and end
            ]);

            // Assert
            expect(result).toHaveLength(10);
            expect(result).toContainEqual({ start: 2, end: 5 });   // Leading part outside ROI
            expect(result).toContainEqual({ start: 6, end: 9 });   // Fully embedded
            expect(result).toContainEqual({ start: 10, end: 12 }); // Gap
            expect(result).toContainEqual({ start: 13, end: 15 }); // Head of spanning range
            expect(result).toContainEqual({ start: 17, end: 19 }); // Tail of spanning range
            expect(result).toContainEqual({ start: 20, end: 23 }); // Fully embedded, touching previous and end
            expect(result).toContainEqual({ start: 25, end: 27 }); // Fully embedded, touching start
            expect(result).toContainEqual({ start: 28, end: 30 }); // Gap
            expect(result).toContainEqual({ start: 33, end: 35 }); // Overlapping start and end
            expect(result).toContainEqual({ start: 38, end: 40 }); // Outside ranges
        });
    });
});

describe('Transformer methods', () => {
    test('Transformer initializes with empty transformations array', () => {
        const transformer = new Transformer("from", "to");
        expect(transformer.transformations).toEqual([]);
    });

    test('Transformer adds conditions correctly', () => {
        const transformer = new Transformer("from", "to");
        transformer.addCondition(3, 2, 1);
        expect(transformer.transformations).toEqual([{ base: 3, end: 4, offset: 1 }]);
    });

    test('Transformer returns input value if no conditions match', () => {
        const transformer = new Transformer("from", "to");
        const result = transformer.transform(10);
        expect(result).toEqual(10);
    });

    test.each([
        [1, 4],
        [2, 5],
        [3, 3]
    ])('Transformer applies transformations correctly', (input, expected) => {
        const transformer = new Transformer("from", "to");
        transformer.addCondition(1, 2, 3);
        const result = transformer.transform(input);
        expect(result).toEqual(expected);
    });
});

describe('Part-one', () => {
    function setupPart1() {
        const solution = new Part1Solution("seeds: 1 2 3 4");
        solution.onMapStart("A", "B");
        return solution;
    }

    test('Part-one initializes with seedline', () => {
        const solution = new Part1Solution("seeds: 1 2 3 4");
        expect(solution.seeds).toEqual([1, 2, 3, 4]);
    });

    test('Part-one onMapStart creates mapping', () => {
        // Arrange
        const solution = new Part1Solution("seeds: 1 2 3 4");
        
        // Act
        solution.onMapStart("A", "B");

        // Assert
        expect(solution.transformer).not.toBeNull();
        expect(solution.transformer.from).toEqual("A");
        expect(solution.transformer.to).toEqual("B");
    });

    test('Part-one onRangeLine adds condition to transformation', () => {
        // Arrange
        const solution = setupPart1();

        // Act
        solution.onRangeLine("4 1 2");

        // Assert
        expect(solution.transformer).not.toBeNull();
        expect(solution.transformer.transformations).toEqual([{ base: 1, end: 2, offset: 3 }]);
    });

    test('Part-one adds multiple conditions correctly', () => {
        // Arrange
        const solution = setupPart1();

        // Act
        solution.onRangeLine("4 1 2");
        solution.onRangeLine("7 5 3");

        // Assert
        expect(solution.transformer).not.toBeNull();
        expect(solution.transformer.transformations).toHaveLength(2);
        expect(solution.transformer.transformations).toContainEqual({ base: 1, end: 2, offset: 3 });
        expect(solution.transformer.transformations).toContainEqual({ base: 5, end: 7, offset: 2 });
    });

    test('Transformers offset can be negative', () => {
        // Arrange
        const solution = setupPart1();

        // Act
        solution.onRangeLine("1 4 2");

        // Assert
        expect(solution.transformer).not.toBeNull();
        expect(solution.transformer.transformations).toEqual([{ base: 4, end: 5, offset: -3 }]);
    });

    test('Part-one performs transformations on map end', () => {
        // Arrange
        const solution = setupPart1();
        solution.onRangeLine("4 1 2");

        // Act
        solution.onMapEnd();

        // Assert
        expect(solution.seeds).toEqual([4, 5, 3, 4]);
    });

    test('Part-one resets transformer after performing transformations', () => {
        // Arrange
        const solution = setupPart1();
        solution.onRangeLine("1 2 3");

        // Act
        solution.onMapEnd();

        // Assert
        expect(solution.transformer).toBeNull();
    });
});

describe('Part-two tests', () => {
    function setupPart2() {
        const solution = new Part2Solution("seeds: 1 2 8 10");
        solution.onMapStart("A", "B");
        return solution;
    }

    test('Part-two initializes correctly', () => {
        const solution = new Part2Solution("seeds: 1 2 8 10");
        expect(solution.roi).not.toBeNull();
        expect(solution.roi.ranges).toHaveLength(2);
        expect(solution.roi.ranges).toContainEqual({start: 1, end: 2});
        expect(solution.roi.ranges).toContainEqual({start: 8, end: 17});
    });

    test('Part-two onRangeLine adds range correctly', () => {
        // Arrange
        const solution = setupPart2();

        // Act
        solution.onRangeLine("4 1 2");

        // Assert
        expect(solution.transformer).not.toBeNull();
        expect(solution.transformer.transformations).toEqual([{ base: 1, end: 2, offset: 3 }]);
    });

    test('Part-two resets transformer after performing transformations', () => {
        const solution = setupPart2();
        solution.onRangeLine("1 2 3");
        solution.onMapEnd();
        expect(solution.transformer).toBeNull();
    });

    test('Transforms ROI on map end', () => {
        // Arrange
        const solution = setupPart2();
        solution.onRangeLine("10 1 2");
        solution.onRangeLine("20 10 2");
        solution.onRangeLine("1 20 2");

        // Act
        solution.onMapEnd();

        // Assert
        expect(solution.roi.ranges).toHaveLength(4);
        expect(solution.roi.ranges).toContainEqual({start: 8, end: 9});
        expect(solution.roi.ranges).toContainEqual({start: 10, end: 11});
        expect(solution.roi.ranges).toContainEqual({start: 12, end: 17});
        expect(solution.roi.ranges).toContainEqual({start: 20, end: 21});
    });
});