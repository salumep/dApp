'use client';
import ArrowLeft from '@/app/_components/UI/ArrowLeft.svg';
import React, { useState, useEffect } from 'react';

interface AjaxPaginationProps {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  changePagination: (page: number) => void;
}

const AjaxPagination: React.FC<AjaxPaginationProps> = ({
  itemsPerPage,
  totalItems,
  currentPage,
  changePagination,
}) => {
  const [pageNumbers, setPageNumbers] = useState<number[]>([]);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    const pages: number[] = [];

    // Generate the page numbers
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    setPageNumbers(pages);
  }, [totalItems, itemsPerPage, totalPages]);

  // Calculate the starting and ending indexes of the page numbers to display
  let startIndex = currentPage - 2;
  let endIndex = currentPage + 2;

  if (startIndex < 1) {
    startIndex = 1;
    endIndex = Math.min(totalPages, 5);
  }

  if (endIndex > totalPages) {
    endIndex = totalPages;
    startIndex = Math.max(1, totalPages - 4);
  }

  // Generate the page number buttons
  const pageButtons = pageNumbers
    .slice(startIndex - 1, endIndex)
    .map((page) => (
      <button
        key={page}
        onClick={() => changePagination(page)}
        className={`mx-1 px-2 py-1 rounded-md ${
          currentPage === page
            ? 'border border-color-primary text-color-primary'
            : 'border border-gray-300 text-gray-300'
        }`}
      >
        {page}
      </button>
    ));

  const handleClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      changePagination(page);
    }
  };

  if (totalPages > 1) {
    return (
      <div className="flex justify-center paginationList pt-4">
        <button
          onClick={() => handleClick(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ArrowLeft fill="#454f5b" />
        </button>
        {startIndex > 1 && (
          <>
            <button
              onClick={() => changePagination(1)}
              className={`mx-1 px-2 py-1 rounded-md ${
                currentPage === 1
                  ? 'border border-primary text-primary'
                  : 'border border-gray-300 text-gray-300'
              }`}
            >
              1
            </button>
            {startIndex > 2 && <span>...</span>}
          </>
        )}
        {pageButtons}
        {endIndex < totalPages && (
          <>
            {endIndex < totalPages - 1 && <span>...</span>}
            <button
              onClick={() => changePagination(totalPages)}
              className={`mx-1 px-2 py-1 rounded-md ${
                currentPage === totalPages
                  ? 'border border-primary text-primary'
                  : 'border border-gray-300 text-gray-300'
              }`}
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => handleClick(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ArrowLeft fill="#454f5b" className="-rotate-180" />
        </button>
      </div>
    );
  }

  return null;
};

export default AjaxPagination;
