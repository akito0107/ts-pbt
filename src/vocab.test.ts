import {test, type TestContext} from 'node:test';
import fc from 'fast-check';

const countries = [
    "Japan",
    "France",
    "Germany",
    "India",
    "China",
    "Brazil",
    "Russia",
    "Spain",
    "Egypt",
    "Nigeria",
    "Canada",
    "United States"
] as const;

type Country = typeof countries[number]

const languages = [
    "Japanese",
    "French",
    "German",
    "Hindi",
    "Mandarin",
    "Portuguese",
    "Russian",
    "Spanish",
    "Arabic",
    "English"
] as const;

type Language = typeof languages[number]

const supportedCountry = (country: string): country is Country => {
    return (countries as any).includes(country)
}

const supportedLanguage = (language: string): language is Language => {
    return (languages as any).includes(language)
}

class Vocabulary {
    private map: Partial<Record<Country, Language>> = {}

    constructor(initial?: Record<Country, Language>) {
        if (initial) {
            this.map = initial
        }
    }

    add(country: string, language: string) {
        if (!supportedCountry(country)) {
            throw new Error("unsupported country")
        }
        if (!supportedLanguage(language)) {
            throw new Error("unsupported language")
        }
        this.map[country] = language
    }

    delete(country : string) {
        if (!supportedCountry(country)) {
            throw new Error("unsupported country")
        }

        if (this.map[country]) {
            delete this.map[country]
        }
    }

    getLanguage(country: string): Language | undefined {
        if (!supportedCountry(country)) {
            throw new Error("unsupported country")
        }
        return this.map[country]
    }

    getCountries(language: string): Country[] {
        if (!supportedLanguage(language)) {
            throw new Error("unsupported language")
        }
        return Object.keys(this.map).filter((country) => {
            if (!supportedCountry(country)) {
                throw new Error("unreachable")
            }
            return this.map[country] === language
        }) as Country[]
    }
}

test('Vocabulary: add and get', (t: TestContext) => {
    fc.assert(fc.property(fc.dictionary(
          fc.constantFrom(...countries),
          fc.constantFrom(...languages)),
        fc.constantFrom(...countries),
        fc.constantFrom(...languages),
        (init, country, language) => {
        const vocab = new Vocabulary(init)
        vocab.add(country, language)
        return vocab.getLanguage(country) === language
    }));
})

test('Vocabulary: remove', (t: TestContext) => {
    fc.assert(fc.property(fc.dictionary(
            fc.constantFrom(...countries),
            fc.constantFrom(...languages)),
        fc.constantFrom(...countries),
        (init, country) => {
            const vocab = new Vocabulary(init)
            vocab.delete(country)
            return !vocab.getLanguage(country)
        }));
})