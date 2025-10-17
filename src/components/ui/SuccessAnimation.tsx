import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export const SuccessAnimation = () => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-8"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        <CheckCircle className="w-24 h-24 text-green-500" />
      </motion.div>
      <motion.h3
        className="text-2xl font-bold text-gray-900 mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Upload Successful!
      </motion.h3>
      <motion.p
        className="text-gray-600 mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Your files have been uploaded successfully.
      </motion.p>
    </motion.div>
  );
};
