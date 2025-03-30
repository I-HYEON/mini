import { useState } from "react";
import { motion } from "framer-motion";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GameCardProps {
  title: string;
  description: string;
  image: string;
  href: string;
  isOpen: boolean;
}

export default function GameCard({
  title,
  description,
  image,
  href,
  isOpen,
}: GameCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!isOpen) {
      e.preventDefault();
      setShowDialog(true);
    }
  };

  return (
    <>
      <motion.div
        className="relative h-full overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800 hover:border-cyan-500 transition-colors duration-300"
        whileHover={{
          y: -5,
          boxShadow: "0 10px 30px -10px rgba(0, 255, 255, 0.5)",
        }}
      >
        <a
          href={isOpen ? href : "#"}
          className="block h-full"
          onClick={handleClick}
        >
          <div className="relative h-64 overflow-hidden">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                <img 
                  src="/placeholder.svg" 
                  alt="not found" 
                  className="object-cover" 
                />
              </div>
            )}
            
            <img
              src={image || "/placeholder.jpg"}
              alt={title}
              className={`w-full h-full object-cover block transition-transform duration-500 hover:scale-110 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
          <div className="p-5">
            <h3 className="text-xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
              {title}
            </h3>
            <p className="text-zinc-400 text-sm">{description}</p>
          </div>
          <div className="absolute top-3 right-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isOpen ? "bg-cyan-500" : "bg-red-500"
              } animate-pulse`}
            />
          </div>
          {!isOpen && (
            <div className="absolute top-3 left-3">
              <Alert className="bg-red-900/50 border-red-500 py-1 px-2">
                <AlertTitle className="text-xs font-semibold text-red-300">
                  준비중
                </AlertTitle>
              </Alert>
            </div>
          )}
        </a>
      </motion.div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="bg-zinc-900 border border-zinc-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
              아직 준비중입니다
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              이 게임은 현재 개발 중이며 곧 이용하실 수 있습니다. 조금만 기다려주세요!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-gradient-to-r from-pink-500 to-cyan-500 text-white hover:opacity-90">
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}