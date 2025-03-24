'use client';

export default function ErrorComponent({ message }: { message: string }) {
  return (
    <div className="max-w-4xl mx-auto p-4 bg-red-50 border-l-4 border-red-500">
      <div className="flex items-center">
        <div className="flex-shrink-0 text-red-500">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Error loading content
          </h3>
          <p className="text-sm text-red-700">
            {message}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}