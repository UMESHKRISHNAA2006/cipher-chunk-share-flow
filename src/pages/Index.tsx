
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EncryptionForm } from '@/components/EncryptionForm';
import { DecryptionForm } from '@/components/DecryptionForm';
import { Lock, Unlock, SplitSquareVertical } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'encrypt' | 'decrypt'>('encrypt');

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'encrypt' | 'decrypt');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="w-full py-6 px-4 md:px-8">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-3">
            <motion.div 
              className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2
              }}
            >
              <SplitSquareVertical className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </motion.div>
          </div>
          
          <motion.h1 
            className="text-3xl md:text-4xl font-bold mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Secure File Encryption with Divide & Conquer
          </motion.h1>
          
          <motion.p 
            className="text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Encrypt and decrypt files using AES-256 encryption with an efficient divide and conquer algorithm.
            Share securely via WhatsApp or any other platform.
          </motion.p>
        </motion.div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 pb-16">
        <motion.div 
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Tabs 
            defaultValue="encrypt" 
            className="w-full" 
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="encrypt" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Encrypt</span>
              </TabsTrigger>
              <TabsTrigger value="decrypt" className="flex items-center gap-2">
                <Unlock className="h-4 w-4" />
                <span>Decrypt</span>
              </TabsTrigger>
            </TabsList>
            
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'encrypt' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="encrypt" className="mt-0">
                <EncryptionForm />
              </TabsContent>
              
              <TabsContent value="decrypt" className="mt-0">
                <DecryptionForm />
              </TabsContent>
            </motion.div>
          </Tabs>
        </motion.div>
        
        <motion.div 
          className="mt-16 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
                <SplitSquareVertical className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-medium">Divide</h3>
              <p className="text-sm text-muted-foreground">
                Files are split into multiple chunks for efficient processing using a divide and conquer approach.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
                <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-medium">Encrypt/Decrypt</h3>
              <p className="text-sm text-muted-foreground">
                Each chunk is processed using AES-256 encryption with your password-derived secure key.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
                <Unlock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-medium">Combine</h3>
              <p className="text-sm text-muted-foreground">
                Processed chunks are recombined to create the final encrypted or decrypted file.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
