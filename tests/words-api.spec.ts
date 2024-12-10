import { test, expect } from '@playwright/test';
import { validateContract } from '../utils/apiUtils';
import { faker } from '@faker-js/faker';


const randomWord = faker.word.adjective()

test.describe('Words API Testing', () => {
  const scenarios = [
    { word: 'beautiful'},
    { word: 'awful'},
    { word: 'joyful'},
  ];
  scenarios.forEach(({ word }) => {
    test(`Get definition of the word ${word}`, async ({ request }) => {
      const response = await request.get(word);
      const responseBody = await response.json()
      
      expect(response).toBeOK()
      expect(response.status()).toBe(200)
      await validateContract(responseBody, 'getWordInfo.json')
    });
  });

  test('Get synonyms of random word', async ({ request }) => {
    const response = await request.get(`${randomWord}/synonyms`);
    const responseBody = await response.json()
    
    expect(response).toBeOK()
    expect(response.status()).toBe(200)
    await validateContract(responseBody, 'getSynonyms.json')
  });

  test('Validate the original word is a synonym of each of its synonyms', async ({ request }) => {
    const responseOriginalWord = await request.get(`${randomWord}/synonyms`);
    const responseBodyOriginalWord = await responseOriginalWord.json()

    expect(responseOriginalWord).toBeOK()
    expect(responseOriginalWord.status()).toBe(200)

    console.log(`The synonym(s) of ${randomWord} is/are ${responseBodyOriginalWord.synonyms}`)
    for (const originalWordSynonym of responseBodyOriginalWord.synonyms) {
      try {
        const responseSynonym = await request.get(`${originalWordSynonym}/synonyms`);
        const responseBodySynonym = await responseSynonym.json()

        expect(responseSynonym).toBeOK()
        expect(responseSynonym.status()).toBe(200)

        const hasOriginalAsSynonym = responseBodySynonym.synonyms.filter((synonym) => synonym == randomWord)
        expect(hasOriginalAsSynonym.length).toBe(1)
        console.log(`${randomWord} is also a synonym of ${originalWordSynonym}`)
      } catch (error) {
        console.error('Error during request:', error);
      }
    }
  });
});
