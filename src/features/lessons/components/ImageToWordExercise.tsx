import React, { useState, useEffect } from "react";
import type { Sign } from "../../../types/lesson";

interface ImageToWordExerciseProps {
  prompt: string;
  options: string[] | undefined;
  sign: Sign | null;
  loadingSign: boolean;
  selectedAnswer: string | null;
  isAnswerCorrect: boolean | null;
  onAnswerSelection: (answer: string) => void;
  signCache?: {
    getSignByWord: (word: string) => Promise<Sign | null>;
    getRandomSigns: (count: number, excludeId?: string) => Sign[];
  };
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const ImageToWordExercise: React.FC<ImageToWordExerciseProps> = ({
  prompt,
  sign,
  loadingSign,
  selectedAnswer,
  isAnswerCorrect,
  onAnswerSelection,
  signCache,
}) => {
  const [imageOptions, setImageOptions] = useState<Sign[]>([]);
  const [loading, setLoading] = useState(true);
  // Store selected option ID to manage UI state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Load alphabet signs from the API or cache
  const getSignByWordFallback = async (word: string): Promise<Sign | null> => {
    try {
      return await import("../../../services/signService").then((module) =>
        module.getSignByWord(word)
      );
    } catch (err) {
      console.error(`Failed to get sign for word ${word}:`, err);
      return null;
    }
  };

  // Load alphabet signs from the API or cache
  useEffect(() => {
    const loadLetterSigns = async () => {
      if (!sign || loadingSign) return;

      // Check if we have stored options for this sign
      const storedOptionsKey = `image_options_${sign.id}`;
      const storedOptions = localStorage.getItem(storedOptionsKey);

      if (storedOptions && selectedAnswer) {
        // If we have stored options and a selection, use those
        const parsedOptions = JSON.parse(storedOptions);
        setImageOptions(parsedOptions);

        // Find the option with the matching word to set the ID
        if (selectedAnswer) {
          const matchingOption = parsedOptions.find(
            (opt: Sign) =>
              opt.word.toLowerCase() === selectedAnswer.toLowerCase()
          );
          if (matchingOption) {
            setSelectedOptionId(matchingOption.id);
          }
        }

        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // We use the correct sign (the one that corresponds to the displayed word/letter)
        const correctSign = sign;

        // Shuffle the alphabet and take 3 random letters different from the correct sign
        const shuffledAlphabet = [...ALPHABET]
          .filter(
            (letter) => letter.toLowerCase() !== correctSign.word.toLowerCase()
          )
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        // Get the signs corresponding to these letters
        const otherSigns: Sign[] = [];

        // For each letter, try to get the corresponding sign from cache or API
        for (const letter of shuffledAlphabet) {
          try {
            // Try to get from cache first, then fallback to API
            const letterSign = signCache
              ? await signCache.getSignByWord(letter)
              : await getSignByWordFallback(letter);

            if (letterSign) {
              otherSigns.push(letterSign);
            }
          } catch (err) {
            console.warn(`Could not find sign for letter ${letter}`, err);
          }
        }

        // If we can use the cache for random signs
        if (signCache && otherSigns.length < 3) {
          // Get random signs excluding the correct one
          const randomSigns = signCache.getRandomSigns(
            3 - otherSigns.length,
            correctSign.id
          );
          otherSigns.push(...randomSigns);
        }

        // Complete with the correct sign
        const finalOptions = [correctSign, ...otherSigns];

        // If we don't have enough signs (less than 4), add placeholders to complete
        if (finalOptions.length < 4) {
          const missingCount = 4 - finalOptions.length;
          console.warn(`Missing ${missingCount} signs, adding placeholders`);

          for (let i = 0; i < missingCount; i++) {
            const placeholderIndex = otherSigns.length + i;
            const placeholderLetter =
              ALPHABET[Math.floor(Math.random() * ALPHABET.length)];

            finalOptions.push({
              id: `placeholder-${placeholderIndex}`,
              word: placeholderLetter,
              definition: `Sign for letter ${placeholderLetter}`,
              mediaUrl: `https://placehold.co/200x200?text=${placeholderLetter}`,
              createdAt: "",
              updatedAt: "",
            });
          }
        }

        // Shuffle options for final display
        const shuffledOptions = [...finalOptions].sort(
          () => Math.random() - 0.5
        );
        setImageOptions(shuffledOptions);
      } catch (error) {
        console.error("Failed to load letter signs:", error);

        // In case of error, use at least the correct sign and placeholders
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        const randomLetters = alphabet
          .filter((letter) => letter.toLowerCase() !== sign.word.toLowerCase())
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        const fallbackOptions = [
          sign,
          ...randomLetters.map((letter, index) => ({
            id: `placeholder-${index}`,
            word: letter,
            definition: `Sign for letter ${letter}`,
            mediaUrl: `https://placehold.co/200x200?text=${letter}`,
            createdAt: "",
            updatedAt: "",
          })),
        ];

        setImageOptions(fallbackOptions.sort(() => Math.random() - 0.5));
      } finally {
        setLoading(false);
      }
    };

    loadLetterSigns();
  }, [sign, loadingSign, signCache, imageOptions.length, selectedAnswer]);

  // Function to handle image selection
  const handleImageSelection = (id: string) => {
    // Save the current options to prevent reshuffling
    if (imageOptions.length > 0) {
      // Store the selected option and prevent re-rendering of options
      localStorage.setItem(
        `image_options_${sign?.id}`,
        JSON.stringify(imageOptions)
      );

      // Set the selected option ID for UI
      setSelectedOptionId(id);

      // Find the selected option to get its word
      const selectedOption = imageOptions.find((option) => option.id === id);

      // If we found the option, pass its word as the answer instead of its ID
      if (selectedOption) {
        console.log(`Selected option: ${selectedOption.word} (ID: ${id})`);
        onAnswerSelection(selectedOption.word);
        return;
      }
    }

    // Fallback: just send the ID if we couldn't find the word
    setSelectedOptionId(id);
    onAnswerSelection(id);
  };

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-4 text-[var(--color-blue)]">
        {prompt}
      </h2>

      {loadingSign || loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin h-8 w-8 border-4 border-[var(--color-blue)] border-t-transparent rounded-full"></div>
        </div>
      ) : sign ? (
        <div className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl">
          {/* Display the word/letter at the top */}
          <div className="text-3xl font-bold mb-6 text-center p-4 bg-blue-50 rounded-xl w-full text-[#38852e]">
            {sign.word}
          </div>

          {/* Image grid */}
          <div className="grid grid-cols-2 gap-4 w-full">
            {imageOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => handleImageSelection(option.id)}
                className={`
                    p-2 border-2 rounded-xl cursor-pointer transition-all
                    ${
                      selectedOptionId === option.id
                        ? "border-[var(--color-blue)] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }
                    ${
                      isAnswerCorrect !== null && selectedOptionId === option.id
                        ? isAnswerCorrect
                          ? "border-green-500 bg-green-50"
                          : "border-red-500 bg-red-50"
                        : ""
                    }
                `}
              >
                <img
                  src={option.mediaUrl}
                  alt={option.word}
                  className="w-full h-40 object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-red-500">
          Sign data not available
        </div>
      )}
    </div>
  );
};

export default ImageToWordExercise;
