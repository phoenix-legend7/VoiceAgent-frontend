import clsx from "clsx";
import { useMemo } from "react";

interface Props {
  currentPage: number;
  totalCounts: number;
  limit: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const PaginationComponent: React.FC<Props> = ({ currentPage, totalCounts, setPage, limit }) => {
  const totalPages = useMemo(() => totalCounts ? Math.ceil(totalCounts / limit) : 1, [limit, totalCounts]);

  const handleClick = (pageNumber: number = currentPage) => {
    if (pageNumber === currentPage) return;
    else if (pageNumber < 1 || pageNumber > totalPages) return;
    else setPage(pageNumber);
  }

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const startPage = Math.max(2, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    pageNumbers.push(
      <li
        key='page1'
        className={clsx(
          'flex items-center justify-center px-3 h-8 rounded-md',
          currentPage === 1
            ? 'bg-sky-700'
            : 'bg-gray-700 hover:bg-gray-800 cursor-pointer transition-colors duration-300'
        )}
        onClick={() => handleClick(1)}
      >
        <a className="page-link">
          1
        </a>
      </li>
    );

    if (startPage > 2) {
      pageNumbers.push(
        <span key='start-ellipsis' className="flex items-end px-1">...</span>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <li
          key={`page${i}`}
          className={clsx(
            'flex items-center justify-center px-3 h-8 rounded-md',
            currentPage === i
              ? 'bg-sky-700'
              : 'bg-gray-700 hover:bg-gray-800 cursor-pointer transition-colors duration-300'
          )}
          onClick={() => handleClick(i)}
        >
          <a className="page-link">
            {i}
          </a>
        </li>
      );
    }

    if (endPage < totalPages - 1) {
      pageNumbers.push(
        <span key='end-ellipsis' className="flex items-end px-1">...</span>
      );
    }

    if (totalPages > 1) {
      pageNumbers.push(
        <li
          key={`page${totalPages}`}
          className={clsx(
            'flex items-center justify-center px-3 h-8 rounded-md',
            currentPage === totalPages
              ? 'bg-sky-700'
              : 'bg-gray-700 hover:bg-gray-800 cursor-pointer transition-colors duration-300'
          )}
          onClick={() => handleClick(totalPages)}
        >
          <a className="page-link">
            {totalPages}
          </a>
        </li>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="flex flex-wrap items-center gap-2 min-w-80 text-white select-none">
      <li
        className={clsx(
          'flex items-center justify-center px-3 h-8 rounded-md',
          currentPage === 1
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-gray-700 hover:bg-gray-800 cursor-pointer transition-colors duration-300'
        )}
        onClick={() => handleClick(currentPage - 1)}
      >
        <a className="flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </a>
      </li>

      {renderPageNumbers()}

      <li
        className={clsx(
          'flex items-center justify-center px-3 h-8 rounded-md',
          currentPage === totalPages
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-gray-700 hover:bg-gray-800 cursor-pointer transition-colors duration-300'
        )}
        onClick={() => handleClick(currentPage + 1)}
      >
        <a className="flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </li>

      <div className="ml-4 text-gray-600">
        Total: {totalCounts}
      </div>
    </div>
  )
}

export default PaginationComponent;