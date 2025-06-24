import React from "react";

interface VideoExerciseProps {
  prompt: string;
  videoUrl: string | undefined;
}

const VideoExercise: React.FC<VideoExerciseProps> = ({ prompt, videoUrl }) => {
  if (!videoUrl) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-[var(--color-blue)]">
        {prompt}
      </h2>
      <div className="aspect-w-16 aspect-h-9 mb-6">
        <iframe
          src={videoUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-64 rounded-lg"
        ></iframe>
      </div>
    </div>
  );
};

export default VideoExercise;
