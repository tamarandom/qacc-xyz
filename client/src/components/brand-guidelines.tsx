import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter 
} from "@/components/ui/card";

/**
 * Brand Guidelines Component
 * 
 * This component displays the QACC brand guidelines for reference
 * including colors, typography, and usage examples.
 */
export function BrandGuidelines() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl mb-6">QACC Brand Guidelines</h1>
      
      <Tabs defaultValue="colors">
        <TabsList>
          <TabsTrigger value="colors">COLORS</TabsTrigger>
          <TabsTrigger value="typography">TYPOGRAPHY</TabsTrigger>
          <TabsTrigger value="usage">USAGE</TabsTrigger>
        </TabsList>
        
        <TabsContent value="colors">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-6">
            {/* Primary Colors */}
            <ColorCard
              name="Black"
              hex="#101010"
              description="Primary Black - Used for backgrounds in dark mode and text in light mode"
              className="bg-[#101010] text-white"
            />
            <ColorCard
              name="Light Gray"
              hex="#F6F6F6"
              description="Light Gray - Used for backgrounds in light mode"
              className="bg-[#F6F6F6] text-[#101010] border border-gray-200"
            />
            <ColorCard
              name="Peach"
              hex="#FBBA80"
              description="Peach - Primary accent color for buttons, links, and highlights"
              className="bg-[#FBBA80] text-[#101010]"
            />
            <ColorCard
              name="Gray"
              hex="#91A0A1"
              description="Gray - Used for secondary text and icons"
              className="bg-[#91A0A1] text-white"
            />
          </div>
          
          <h3 className="text-xl mb-4 mt-8">Secondary Colors</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Black Variations */}
            <ColorCard
              name="Black 300"
              hex="#282828"
              description="Used for container backgrounds in dark mode"
              className="bg-[#282828] text-white"
            />
            <ColorCard
              name="Black 200"
              hex="#404040"
              description="Used for borders and separators in dark mode"
              className="bg-[#404040] text-white"
            />
            <ColorCard
              name="Black 100"
              hex="#636363"
              description="Used for secondary text in dark mode"
              className="bg-[#636363] text-white"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Peach Variations */}
            <ColorCard
              name="Peach 300"
              hex="#FCD1AA"
              description="Used for hover states and gradients"
              className="bg-[#FCD1AA] text-[#101010]"
            />
            <ColorCard
              name="Peach 200"
              hex="#FDE0C7"
              description="Used for subtle accents and backgrounds"
              className="bg-[#FDE0C7] text-[#101010]"
            />
            <ColorCard
              name="Peach 100"
              hex="#FEF0E3"
              description="Used for very subtle highlights"
              className="bg-[#FEF0E3] text-[#101010]"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Gray Variations */}
            <ColorCard
              name="Gray 300"
              hex="#B6C0C0"
              description="Used for secondary text in light mode"
              className="bg-[#B6C0C0] text-[#101010]"
            />
            <ColorCard
              name="Gray 200"
              hex="#E7EAEA"
              description="Used for borders and separators in light mode"
              className="bg-[#E7EAEA] text-[#101010]"
            />
            <ColorCard
              name="Gray 100"
              hex="#F6F6F6"
              description="Used for container backgrounds in light mode"
              className="bg-[#F6F6F6] text-[#101010] border border-gray-200"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="typography">
          <div className="mt-6 space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl mb-2">Primary Font: Tusker Grotesk</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                Tusker Grotesk is a headline typeface designed for robust and high-impact use. 
                Each width set is duplexed, stackable and is ideal for headlines, logos and bold 
                attention-grabbing editorial design.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-[#191919] rounded-md border border-gray-200 dark:border-[#282828]">
                  <p className="font-tusker text-4xl font-bold mb-2">Tusker Grotesk 4500 Bold</p>
                  <p className="font-tusker text-2xl font-bold text-[#FBBA80]">
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                    abcdefghijklmnopqrstuvwxyz<br />
                    1234567890@#$%&*
                  </p>
                </div>
                
                <div className="p-4 bg-white dark:bg-[#191919] rounded-md border border-gray-200 dark:border-[#282828]">
                  <p className="font-tusker text-4xl font-medium mb-2">Tusker Grotesk 6700 Medium</p>
                  <p className="font-tusker text-2xl font-medium text-[#FBBA80]">
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                    abcdefghijklmnopqrstuvwxyz<br />
                    1234567890@#$%&*
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl mb-2">Secondary Font: IBM Plex Mono</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                IBM Plex Mono is an international typeface family designed to illustrate the 
                unique relationship between mankind and machine. The result is a neutral yet 
                friendly Grotesque style typeface that balances design with engineered details.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-[#191919] rounded-md border border-gray-200 dark:border-[#282828]">
                  <p className="font-mono text-lg font-bold mb-2">IBM Plex Mono Bold</p>
                  <p className="font-mono text-base font-bold">
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                    abcdefghijklmnopqrstuvwxyz<br />
                    1234567890@#$%&*
                  </p>
                </div>
                
                <div className="p-4 bg-white dark:bg-[#191919] rounded-md border border-gray-200 dark:border-[#282828]">
                  <p className="font-mono text-lg font-medium mb-2">IBM Plex Mono Medium</p>
                  <p className="font-mono text-base font-medium">
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                    abcdefghijklmnopqrstuvwxyz<br />
                    1234567890@#$%&*
                  </p>
                </div>
                
                <div className="p-4 bg-white dark:bg-[#191919] rounded-md border border-gray-200 dark:border-[#282828]">
                  <p className="font-mono text-lg font-normal mb-2">IBM Plex Mono Regular</p>
                  <p className="font-mono text-base font-normal">
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                    abcdefghijklmnopqrstuvwxyz<br />
                    1234567890@#$%&*
                  </p>
                </div>
                
                <div className="p-4 bg-white dark:bg-[#191919] rounded-md border border-gray-200 dark:border-[#282828]">
                  <p className="font-mono text-lg font-light mb-2">IBM Plex Mono Light</p>
                  <p className="font-mono text-base font-light">
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                    abcdefghijklmnopqrstuvwxyz<br />
                    1234567890@#$%&*
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="usage">
          <div className="mt-6 space-y-8">
            <div>
              <h3 className="text-xl mb-4">Typography Usage</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-white dark:bg-[#191919] rounded-md border border-gray-200 dark:border-[#282828]">
                  <h4 className="font-tusker text-2xl font-bold mb-2">Headlines</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">H1 - Tusker Grotesk Bold</p>
                      <h1 className="font-tusker text-4xl font-bold">THE FUTURE OF TOKENISATION</h1>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">H2 - Tusker Grotesk Bold</p>
                      <h2 className="font-tusker text-3xl font-bold">QUADRATIC ACCELERATOR</h2>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">H3 - Tusker Grotesk Medium</p>
                      <h3 className="font-tusker text-2xl font-medium">PROJECT ACCELERATION</h3>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-white dark:bg-[#191919] rounded-md border border-gray-200 dark:border-[#282828]">
                  <h4 className="font-tusker text-2xl font-bold mb-2">Body Text</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Body - IBM Plex Mono Regular</p>
                      <p className="font-mono">
                        The Quadratic Accelerator is pioneering a novel tokenization protocol that combines 
                        the best features of Quadratic Funding (QF) and Augmented Bonding Curves (ABCs).
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Link - IBM Plex Mono Bold</p>
                      <p>
                        <a href="#" className="font-mono font-bold text-[#FBBA80] hover:text-[#FCD1AA]">
                          Learn more about q/acc →
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl mb-4">UI Components</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-white dark:bg-[#191919] rounded-md border border-gray-200 dark:border-[#282828]">
                  <h4 className="font-tusker text-2xl font-bold mb-4">Buttons</h4>
                  <div className="flex flex-wrap gap-4">
                    <button className="bg-[#FBBA80] text-[#101010] px-4 py-2 rounded-md font-mono font-bold hover:bg-[#FCD1AA]">
                      Primary Button
                    </button>
                    <button className="bg-[#191919] text-white border border-[#FBBA80] px-4 py-2 rounded-md font-mono hover:bg-[#282828]">
                      Secondary Button
                    </button>
                    <button className="bg-[#101010] text-[#FBBA80] px-4 py-2 rounded-md font-mono hover:bg-[#282828]">
                      Dark Button
                    </button>
                  </div>
                </div>
                
                <div className="p-6 bg-white dark:bg-[#191919] rounded-md border border-gray-200 dark:border-[#282828]">
                  <h4 className="font-tusker text-2xl font-bold mb-4">Cards & Elements</h4>
                  <div className="flex flex-col gap-4">
                    <div className="bg-[#282828] p-4 rounded-md border border-[#404040]">
                      <h5 className="font-tusker text-lg font-medium text-[#FBBA80] mb-2">Card Title</h5>
                      <p className="font-mono text-sm text-gray-300">Card content with IBM Plex Mono text.</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-[#FBBA80] to-[#FCD1AA] p-4 rounded-md">
                      <h5 className="font-tusker text-lg font-medium text-[#101010] mb-2">GRADIENT ELEMENT</h5>
                      <p className="font-mono text-sm text-[#101010]">With accent coloring</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for displaying color swatches
function ColorCard({ name, hex, description, className = "" }) {
  return (
    <div className={`rounded-lg p-4 ${className}`}>
      <h3 className="font-bold mb-1">{name}</h3>
      <p className="text-sm mb-2">{hex}</p>
      <p className="text-xs opacity-80">{description}</p>
    </div>
  );
}