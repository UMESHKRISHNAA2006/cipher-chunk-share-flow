
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
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A]">
      <header className="w-full py-8 px-4 md:px-8">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-4">
            <motion.div 
              className="h-24 w-24 md:h-32 md:w-32 rounded-xl bg-black flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.3)]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2
              }}
            >
              <img 
                src="/lovable-uploads/a0cf7b14-7a4d-42fb-bd18-cee670fb2dc3.png" 
                alt="QuantumX Logo" 
                className="h-20 w-20 md:h-28 md:w-28"
              />
            </motion.div>
          </div>
          
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-3 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            QuantumX
          </motion.h1>
          
          <motion.p 
            className="text-gray-300 max-w-2xl mx-auto text-lg font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Secure File Encryption with Quantum Technology
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
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-[#1A1A1A] border border-gray-800">
              <TabsTrigger value="encrypt" className="flex items-center gap-2 text-white font-semibold data-[state=active]:bg-[#2A2A2A]">
                <Lock className="h-4 w-4" />
                <span>Encrypt</span>
              </TabsTrigger>
              <TabsTrigger value="decrypt" className="flex items-center gap-2 text-white font-semibold data-[state=active]:bg-[#2A2A2A]">
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
          className="mt-16 bg-[#1A1A1A] rounded-xl p-8 shadow-lg border border-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-white">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-full bg-[#2A2A2A] flex items-center justify-center mb-4 shadow-md">
                <SplitSquareVertical className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Divide</h3>
              <p className="text-gray-400 font-medium">
                Files are split into multiple chunks for efficient processing using a divide and conquer approach.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-full bg-[#2A2A2A] flex items-center justify-center mb-4 shadow-md">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Encrypt/Decrypt</h3>
              <p className="text-gray-400 font-medium">
                Each chunk is processed using AES-256 encryption with your password-derived secure key.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-full bg-[#2A2A2A] flex items-center justify-center mb-4 shadow-md">
                <Unlock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Combine</h3>
              <p className="text-gray-400 font-medium">
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
