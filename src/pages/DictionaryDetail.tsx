import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSignCache } from "../features/lessons/hooks/useSignCache";
import { isValidImageUrl, getFallbackImageUrl } from "../utils/imageUtils";
import type { Sign } from "../types/lesson";

const DictionaryDetail: React.FC = () => {
  const { signId } = useParams<{ signId: string }>();
  const { getSignById, isLoading, getRandomSigns, allSigns } = useSignCache();
  const [sign, setSign] = useState<Sign | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load the sign only when signId or getSignById changes
  useEffect(() => {
    let cancelled = false;
    const loadSign = async () => {
      if (!signId) {
        setError("Missing sign ID");
        return;
      }
      try {
        setError(null);
        setSign(null);
        const signData = await getSignById(signId);
        if (!signData) {
          setError("Sign not found");
          return;
        }
        if (!cancelled) setSign(signData);
      } catch (err) {
        if (!cancelled) setError("Unable to load sign details");
      }
    };
    loadSign();
    return () => {
      cancelled = true;
    };
  }, [signId, getSignById]);

  // Dynamic calculation of related signs
  let relatedSigns: Sign[] = [];
  if (sign && sign.word && sign.word.length > 0) {
    const firstLetter = sign.word[0].toUpperCase();
    const similarSigns = allSigns
      .filter(
        (s) =>
          s.word &&
          s.word.length > 0 &&
          s.word[0].toUpperCase() === firstLetter &&
          s.id !== sign.id
      )
      .slice(0, 4);
    if (similarSigns.length > 0) {
      relatedSigns = similarSigns;
    } else {
      relatedSigns = getRandomSigns(4, sign?.id);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[var(--color-blue)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-500">{error}</p>
          <Link
            to="/dictionary"
            className="text-[var(--color-blue)] mt-2 inline-block"
          >
            Back to Dictionary
          </Link>
        </div>
      </div>
    );
  }

  if (!sign) {
    return null;
  }

  return (
    <div key={signId} className="container mx-auto p-4">
      <Link
        to="/dictionary"
        className="text-[var(--color-blue)] font-medium mb-4 inline-block hover:underline"
      >
        ← Back to Dictionary
      </Link>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 p-4 flex justify-center items-center">
            <div className="w-full flex justify-center items-center min-h-[250px]">
              <img
                src={
                  isValidImageUrl(sign.mediaUrl)
                    ? sign.mediaUrl
                    : getFallbackImageUrl(sign.word)
                }
                alt={sign.word}
                className="max-h-72 max-w-full object-contain mx-auto"
                loading="lazy"
              />
            </div>
          </div>

          <div className="w-full md:w-1/2 p-4">
            <h1 className="text-3xl font-bold mb-4 text-[var(--color-blue)]">
              {sign.word}
            </h1>

            {sign.definition && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Definition</h2>
                <p className="text-gray-700">{sign.definition}</p>
              </div>
            )}

            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Information</h2>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>ID:</strong> {sign.id}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Last updated:</strong>{" "}
                  {new Date(sign.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedSigns.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Similar Signs</h2>
          <div className="w-full mx-auto" style={{ maxWidth: "1200px" }}>
            <div className="flex flex-wrap justify-center gap-6">
              {relatedSigns.map((relatedSign) => (
                <div key={relatedSign.id} className="w-[200px] flex-shrink-0">
                  <Link
                    to={`/dictionary/${relatedSign.id}`}
                    className="block w-full h-full border-2 border-gray-200 p-4 rounded-xl hover:border-[var(--color-blue)] hover:shadow-md transition-all bg-white"
                  >
                    <div className="h-32 flex justify-center items-center mb-2">
                      <img
                        src={
                          isValidImageUrl(relatedSign.mediaUrl)
                            ? relatedSign.mediaUrl
                            : getFallbackImageUrl(relatedSign.word)
                        }
                        alt={relatedSign.word}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="text-center font-semibold text-gray-800">
                      {relatedSign.word}
                    </h3>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DictionaryDetail;
