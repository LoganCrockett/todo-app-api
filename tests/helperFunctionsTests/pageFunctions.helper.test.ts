import getTotalPages from "../../helperFunctions/pageFunctions.helper";

const validTestData = [
    {
        totalCount: 17,
        perPage: 5,
        expected: 4
    },
    {
        totalCount: 24,
        perPage: 5,
        expected: 5
    },
    {
        totalCount: 51,
        perPage: 50,
        expected: 2
    },
    {
        totalCount: 33,
        perPage: 10,
        expected: 4
    }
];

describe("getTotalPages (Valid)", () => {
    test("Total Count is less than perPage", () => {
        const returnValue = getTotalPages(10, 11);

        expect(returnValue).toEqual(1);
    });

    test.each(validTestData)("Testing Total Pages value", (data) => {
        const returnValue = getTotalPages(data.totalCount, data.perPage)
        expect(returnValue).toEqual(data.expected);
    })
});

describe("getTotalPages (Invalid)", () => {
    test("Total Count is NaN", () => {
        expect(() => {
            getTotalPages("asdf" as any, 20)
        }).toThrowError("Parameters must be a number");
    });

    test("Per Page is NaN", () => {
        expect(() => {
            getTotalPages(1, "asdf" as any)
        }).toThrowError("Parameters must be a number");
    });

    test("Total Count is 0", () => {
        const returnValue = getTotalPages(0, 20);

        expect(returnValue).toEqual(0);
    });

    test("Per Page is 0", () => {
        const returnValue = getTotalPages(1, 0);

        expect(returnValue).toEqual(0);
    });
});