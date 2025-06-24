import { useState, useEffect } from "react";

interface DragDropItem {
  id: string;
  text: string;
}

interface DragDropExerciseProps {
  question: string;
  items: DragDropItem[];
  correctOrder: string[];
  onComplete: (score: number) => void;
}

const DragDropExercise = ({
  question,
  items,
  correctOrder,
  onComplete,
}: DragDropExerciseProps) => {
  const [availableItems, setAvailableItems] = useState<DragDropItem[]>([]);
  const [placedItems, setPlacedItems] = useState<DragDropItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<DragDropItem | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    // Shuffle available items
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setAvailableItems(shuffled);
  }, [items]);

  const handleDragStart = (item: DragDropItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropToPlaced = (e: React.DragEvent) => {
    e.preventDefault();

    if (!draggedItem) return;

    // Move item from available to placed
    if (availableItems.find((item) => item.id === draggedItem.id)) {
      setAvailableItems((prev) =>
        prev.filter((item) => item.id !== draggedItem.id)
      );
      setPlacedItems((prev) => [...prev, draggedItem]);
    }
    // Reorder within placed items
    else if (placedItems.find((item) => item.id === draggedItem.id)) {
      // For simplicity, we'll just keep the existing order in this example
      // A full implementation would handle reordering within the placed items
    }

    setDraggedItem(null);
  };

  const handleDropToAvailable = (e: React.DragEvent) => {
    e.preventDefault();

    if (!draggedItem) return;

    // Only handle drops from placed items
    if (placedItems.find((item) => item.id === draggedItem.id)) {
      setPlacedItems((prev) =>
        prev.filter((item) => item.id !== draggedItem.id)
      );
      setAvailableItems((prev) => [...prev, draggedItem]);
    }

    setDraggedItem(null);
  };

  const checkAnswer = () => {
    // Compare placed items order with correct order
    const currentOrder = placedItems.map((item) => item.id);
    const isAnswerCorrect =
      currentOrder.length === correctOrder.length &&
      currentOrder.every((id, index) => id === correctOrder[index]);

    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setFeedback("Correct! Great job arranging the items in order.");
      onComplete(1);
    } else {
      setFeedback(
        "Not quite right. Try rearranging the items in the correct order."
      );
    }
  };

  const resetExercise = () => {
    // Reset to initial state
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setAvailableItems(shuffled);
    setPlacedItems([]);
    setIsCorrect(null);
    setFeedback("");
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">{question}</h3>

      {/* Drop zone for ordered items */}
      <div
        className={`
          border-2 rounded-lg p-4 min-h-[100px] mb-8 transition-colors
          ${
            isCorrect === true
              ? "border-green-500 bg-green-50"
              : isCorrect === false
              ? "border-red-500 bg-red-50"
              : "border-dashed border-blue-300 bg-blue-50"
          }
        `}
        onDragOver={handleDragOver}
        onDrop={handleDropToPlaced}
      >
        {placedItems.length === 0 ? (
          <p className="text-center text-gray-500 my-4">
            Drag and drop items here in the correct order
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {placedItems.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item)}
                className="p-2 bg-white rounded border border-gray-300 cursor-move flex items-center shadow-sm"
              >
                <span className="mr-2 inline-flex items-center justify-center bg-blue-100 text-blue-800 w-6 h-6 rounded-full text-xs font-bold">
                  {index + 1}
                </span>
                {item.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available items */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Available Items</h4>
        <div
          className="border-2 rounded-lg p-4 border-gray-200"
          onDragOver={handleDragOver}
          onDrop={handleDropToAvailable}
        >
          {availableItems.length === 0 ? (
            <p className="text-center text-gray-500 my-4">
              All items have been placed
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableItems.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item)}
                  className="p-2 bg-white rounded border border-gray-300 cursor-move"
                >
                  {item.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feedback area */}
      {feedback && (
        <div
          className={`
          mb-6 p-4 rounded-lg
          ${
            isCorrect
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }
        `}
        >
          <p className="font-medium">{feedback}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-between">
        <button
          onClick={resetExercise}
          className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Reset
        </button>

        <button
          onClick={checkAnswer}
          disabled={placedItems.length !== correctOrder.length}
          className={`
            px-6 py-2 rounded-lg font-bold
            ${
              placedItems.length === correctOrder.length
                ? "bg-[var(--color-blue)] text-black cursor-pointer"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }
          `}
        >
          Check
        </button>
      </div>
    </div>
  );
};

export default DragDropExercise;
