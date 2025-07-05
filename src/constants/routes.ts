export const ROUTES = {
  HOME: "/",
  SIGNUP: "/signup",
  SIGNIN: "/signin",
  COURSES: "/courses",
  COURSES_LESSON: "/courses/:lessonId",
  LESSONS: "/lessons",
  LESSON_DETAIL: "/lessons/:lessonId",
  COURSES_JOURNEY: {
    HOME: "/coursesJourney/home",
    QUESTS: "/coursesJourney/quests",
    LEAGUE: "/coursesJourney/league",
    PROFILE: "/coursesJourney/profile",
    TRAINING: "/coursesJourney/training",
    SHOP: "/coursesJourney/shop",
    DICTIONARY: "/coursesJourney/dictionary",
    DICTIONARY_DETAILS: "/coursesJourney/dictionary/:signId",
  },
} as const;

/**
 * API route definitions
 *
 * This file contains all API endpoint routes used in the application.
 * Update these to match your backend API structure.
 */

export const API_URL: string =
  import.meta.env.VITE_API_URL + import.meta.env.VITE_API_SUFFIX_URL;

export const API_ROUTES = {
  // Auth endpoints
  signUp: API_URL + "/auth/register",
  logIn: API_URL + "/auth/login",
  logout: API_URL + "/auth/logout",
  refreshToken: API_URL + "/auth/refresh",
  currentUser: API_URL + "/auth/me",

  // Profile endpoints
  getProfile: API_URL + "/users/me",
  deleteProfile: API_URL + "/users/me",
  changePassword: API_URL + "/users/me/password",

  // User management
  getAllUsers: API_URL + "/users",
  getUserById: (id: string) => API_URL + `/users/${id}`,
  getUserByEmail: (email: string) => API_URL + `/users/email/${email}`,
  getUserByUsername: (username: string) =>
    API_URL + `/user/username/${username}`,
  updateUser: (id: string) => API_URL + `/users/${id}`,
  deleteUser: (id: string) => API_URL + `/users/${id}`,

  // OAuth routes
  googleAuth: API_URL + "/auth/google",
  googleAuthRedirect: API_URL + "/auth/google/callback",

  // Dictionary endpoints
  getDictionary: API_URL + "/dictionary",
  getDictionaryEntry: (id: string) => API_URL + `/dictionary/${id}`,

  // Lesson endpoints
  getLessons: API_URL + "/lessons",
  getLessonById: (id: string) => API_URL + `/lessons/${id}`,
  getLessonProgress: API_URL + "/lesson-progress",
  startLessonProgress: API_URL + "/lesson-progress/start",
  updateLessonProgress: (id: string) =>
    API_URL + `/lesson-progress/${id}/update`,
  completeLessonProgress: (id: string) =>
    API_URL + `/lesson-progress/${id}/complete`,
  resetLessonProgress: (id: string) => API_URL + `/lesson-progress/${id}/reset`,

  // Exercise endpoints
  getExercises: (lessonId: string) => API_URL + `/exercises/lesson/${lessonId}`,
  getExerciseById: (id: string) => API_URL + `/exercises/${id}`,
  submitExerciseAnswer: (id: string) => API_URL + `/exercises/${id}/check`,

  // Sign endpoints
  getAllSigns: API_URL + "/signs",
  getSignById: (id: string) => API_URL + `/signs/${id}`,
  getSignByWord: (word: string) => API_URL + `/signs/search/${word}`,
  searchSignByName: (name: string) => API_URL + `/signs/search/${name}`,

  // Download model
  downloadModel: (modelId: string) => API_URL + `/models/download/${modelId}`,
};
