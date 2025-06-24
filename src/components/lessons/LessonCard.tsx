import { Link } from "react-router-dom";
import { Button } from "../ui";
import type { Lesson } from "../../types/lesson";

export interface LessonWithProgress extends Lesson {
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}

interface LessonCardProps {
  lesson: LessonWithProgress;
  index: number;
  isLocked: boolean;
}

const LessonCard = ({ lesson, index, isLocked }: LessonCardProps) => {
  const getStatusColor = () => {
    switch (lesson.status) {
      case "COMPLETED":
        return "bg-green-500";
      case "IN_PROGRESS":
        return "bg-yellow-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div
      className={`
        relative rounded-2xl p-5 border-2 w-[280px] h-[180px] flex flex-col justify-between
        ${
          isLocked
            ? "border-gray-400 bg-gray-100 opacity-70"
            : "border-[var(--color-border)] hover:shadow-md transition-all duration-200"
        }
      `}
    >
      {/* Level indicator */}
      <div className="absolute top-3 right-3 text-xs py-1 px-2 rounded-full bg-[var(--color-blue)] text-white">
        {lesson.level.toLowerCase()}
      </div>

      {/* Lesson number */}
      <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-blue)] text-white font-bold shadow-md">
        {index + 1}
      </div>

      <div>
        <h3 className="text-lg font-bold mb-2">{lesson.title}</h3>
        <p className="text-sm line-clamp-2">{lesson.description}</p>
      </div>

      <div className="flex justify-between items-center mt-4">
        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
          <span className="text-xs">
            {lesson.status === "COMPLETED"
              ? "Completed"
              : lesson.status === "IN_PROGRESS"
              ? "In Progress"
              : "Not Started"}
          </span>
        </div>

        {isLocked ? (
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="text-sm text-gray-500">Locked</span>
          </div>
        ) : (
          <Link to={`/lessons/${lesson.id}`}>
            <Button
              variant="primary"
              size="sm"
              className={lesson.status === "COMPLETED" ? "bg-green-500" : ""}
            >
              {lesson.status === "COMPLETED"
                ? "Review"
                : lesson.status === "IN_PROGRESS"
                ? "Continue"
                : "Start"}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default LessonCard;
