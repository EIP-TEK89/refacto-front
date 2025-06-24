import { useState, useEffect } from "react";

// Matching exercise interface
interface MatchingItem {
  id: string;
  term: string;
  definition: string;
}

interface MatchingExerciseProps {
  items: MatchingItem[];
  onComplete: (score: number) => void;
}

const MatchingExercise = ({ items, onComplete }: MatchingExerciseProps) => {
  const [terms, setTerms] = useState<MatchingItem[]>([]);
  const [definitions, setDefinitions] = useState<MatchingItem[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<string | null>(
    null
  );
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Shuffle the items for display
    const shuffledTerms = [...items];
    const shuffledDefinitions = [...items];

    // Fisher-Yates shuffle algorithm
    for (let i = shuffledTerms.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledTerms[i], shuffledTerms[j]] = [
        shuffledTerms[j],
        shuffledTerms[i],
      ];
    }

    for (let i = shuffledDefinitions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledDefinitions[i], shuffledDefinitions[j]] = [
        shuffledDefinitions[j],
        shuffledDefinitions[i],
      ];
    }

    setTerms(shuffledTerms);
    setDefinitions(shuffledDefinitions);
  }, [items]);

  const handleTermClick = (id: string) => {
    // If this term is already matched, don't allow selection
    if (matches[id]) return;

    setSelectedTerm(id);

    // If we already have a definition selected, try to make a match
    if (selectedDefinition) {
      makeMatch(id, selectedDefinition);
    }
  };

  const handleDefinitionClick = (id: string) => {
    // If this definition is already matched, don't allow selection
    if (Object.values(matches).includes(id)) return;

    setSelectedDefinition(id);

    // If we already have a term selected, try to make a match
    if (selectedTerm) {
      makeMatch(selectedTerm, id);
    }
  };

  const makeMatch = (termId: string, defId: string) => {
    // Find the actual items
    const term = items.find((item) => item.id === termId);
    const def = items.find((item) => item.id === defId);

    if (term && def) {
      // Check if match is correct (the ids should be the same for matching pairs)
      const isCorrect = termId === defId;

      if (isCorrect) {
        // Add to successful matches
        setMatches((prev) => ({
          ...prev,
          [termId]: defId,
        }));

        // Increase score
        setScore((prev) => prev + 1);
      } else {
        // Mark as error briefly
        setErrors((prev) => ({
          ...prev,
          [termId]: true,
          [defId]: true,
        }));

        // Clear error state after a delay
        setTimeout(() => {
          setErrors({});
        }, 1000);
      }
    }

    // Reset selections
    setSelectedTerm(null);
    setSelectedDefinition(null);

    // Check if all items are matched
    const allMatched = Object.keys(matches).length + 1 >= items.length;
    if (allMatched) {
      setCompleted(true);
      onComplete(score + 1);
    }
  };

  // Check if an item is selected
  const isTermSelected = (id: string) => selectedTerm === id;
  const isDefinitionSelected = (id: string) => selectedDefinition === id;

  // Check if an item is matched
  const isTermMatched = (id: string) => id in matches;
  const isDefinitionMatched = (id: string) =>
    Object.values(matches).includes(id);

  // Check if an item has an error
  const hasError = (id: string) => !!errors[id];

  return (
    <div className="p-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Match the correct pairs</h3>
        <p className="text-sm text-gray-600">
          Select a term and then select its matching definition
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Terms column */}
        <div>
          <h4 className="font-medium mb-3">Terms</h4>
          <div className="space-y-3">
            {terms.map((item) => (
              <div
                key={item.id}
                onClick={() => handleTermClick(item.id)}
                className={`
                  p-3 border-2 rounded-lg cursor-pointer transition-all
                  ${
                    isTermMatched(item.id) ? "border-green-500 bg-green-50" : ""
                  }
                  ${isTermSelected(item.id) ? "border-blue-500 bg-blue-50" : ""}
                  ${hasError(item.id) ? "border-red-500 bg-red-50" : ""}
                  ${
                    !isTermMatched(item.id) &&
                    !isTermSelected(item.id) &&
                    !hasError(item.id)
                      ? "border-gray-200 hover:border-gray-300"
                      : ""
                  }
                `}
              >
                {item.term}
              </div>
            ))}
          </div>
        </div>

        {/* Definitions column */}
        <div>
          <h4 className="font-medium mb-3">Definitions</h4>
          <div className="space-y-3">
            {definitions.map((item) => (
              <div
                key={item.id}
                onClick={() => handleDefinitionClick(item.id)}
                className={`
                  p-3 border-2 rounded-lg cursor-pointer transition-all
                  ${
                    isDefinitionMatched(item.id)
                      ? "border-green-500 bg-green-50"
                      : ""
                  }
                  ${
                    isDefinitionSelected(item.id)
                      ? "border-blue-500 bg-blue-50"
                      : ""
                  }
                  ${hasError(item.id) ? "border-red-500 bg-red-50" : ""}
                  ${
                    !isDefinitionMatched(item.id) &&
                    !isDefinitionSelected(item.id) &&
                    !hasError(item.id)
                      ? "border-gray-200 hover:border-gray-300"
                      : ""
                  }
                `}
              >
                {item.definition}
              </div>
            ))}
          </div>
        </div>
      </div>

      {completed && (
        <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-lg">
          <p className="font-medium">
            All matches complete! Score: {score}/{items.length}
          </p>
        </div>
      )}
    </div>
  );
};

export default MatchingExercise;
