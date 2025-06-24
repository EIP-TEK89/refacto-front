const Home = () => {
  return (
    <div className="container-card">
      <h1 className="text-2xl font-bold mb-4 text-[var(--color-blue)]">
        Welcome to TrioSigno
      </h1>
      <p className="mb-6">
        Start learning sign language today with our interactive lessons!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Feature Cards */}
        <div className="feature-card">
          <h2>Learn at Your Own Pace</h2>
          <p>Our bite-sized lessons make it easy to practice every day.</p>
        </div>

        <div className="feature-card">
          <h2>Track Your Progress</h2>
          <p>See your improvement over time with detailed statistics.</p>
        </div>

        <div className="feature-card">
          <h2>Join the Community</h2>
          <p>Connect with millions of learners from around the world.</p>
        </div>
      </div>

      <div className="mt-10 mb-6">
        <h3 className="text-xl font-bold mb-4 text-[var(--color-text-blue)]">
          Get Started Today
        </h3>
        <button className="button-primary max-w-md mx-auto">
          Start Learning
        </button>
      </div>
    </div>
  );
};

export default Home;
