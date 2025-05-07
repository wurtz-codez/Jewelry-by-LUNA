import { useEffect } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed top-20 right-4 z-[100] flex items-center justify-between p-4 rounded-sm shadow-lg bg-white border-b-2 border-primary-washed"
    >
      <div className="flex items-center gap-3">
        {type === 'success' ? (
          <FiCheck className="w-5 h-5 text-green-500" />
        ) : (
          <FiX className="w-5 h-5 text-red-500" />
        )}
        <span className="text-gray-800">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 focus:outline-none ml-4"
      >
        <FiX className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast; 