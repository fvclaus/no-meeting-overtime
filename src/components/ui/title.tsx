import { Calendar, Clock } from "lucide-react";

export function Title({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <>
      <div className="w-full max-w-4xl text-center px-4 mb-8 mt-10">
        <div className="flex justify-center space-x-6 mb-8">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center transition-colors hover:bg-blue-100">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center transition-colors hover:bg-blue-100">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-800 sm:text-5xl">
          {title}
          {subtitle && <span className="block text-blue-600">{subtitle}</span>}
        </h1>
      </div>
    </>
  );
}
