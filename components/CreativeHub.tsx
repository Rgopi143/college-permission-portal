
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

interface CreativeHubProps {
  onNotify: (msg: string, type: 'success' | 'error') => void;
}

const CreativeHub: React.FC<CreativeHubProps> = ({ onNotify }) => {
  const [activeTool, setActiveTool] = useState<'image' | 'video'>('image');
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  
  // Image states
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Video states
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkKeyStatus();
  }, []);

  const checkKeyStatus = async () => {
    try {
      // @ts-ignore
      const status = await window.aistudio.hasSelectedApiKey();
      setHasKey(status);
    } catch (e) {
      setHasKey(false);
    }
  };

  const handleOpenKeyPicker = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasKey(true);
    } catch (e) {
      onNotify("Failed to open key picker", "error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateImage = async () => {
    if (!imagePrompt.trim()) return onNotify("Please enter a prompt", "error");
    setIsGenerating(true);
    setGeneratedImage(null);
    setProgressMessage("Envisioning your request...");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: imagePrompt }] },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
            imageSize: imageSize as any
          }
        }
      });

      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        setGeneratedImage(`data:image/png;base64,${imagePart.inlineData.data}`);
        onNotify("Image generated successfully!", "success");
      } else {
        throw new Error("No image data returned");
      }
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("entity was not found")) {
        setHasKey(false);
      }
      onNotify("Image generation failed. Ensure your API key has credits.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVideo = async () => {
    if (!selectedFile) return onNotify("Please upload a starting image", "error");
    setIsGenerating(true);
    setGeneratedVideo(null);
    
    const messages = [
      "Analyzing visual structures...",
      "Interpolating temporal frames...",
      "Applying motion vectors...",
      "Rendering cinematic details...",
      "Finalizing MP4 stream..."
    ];
    
    let msgIndex = 0;
    const interval = setInterval(() => {
      setProgressMessage(messages[msgIndex % messages.length]);
      msgIndex++;
    }, 8000);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Image = filePreview?.split(',')[1] || '';
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: videoPrompt || "Subtle cinematic motion and atmosphere",
        image: {
          imageBytes: base64Image,
          mimeType: selectedFile.type,
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: videoAspectRatio
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const fetchResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const videoBlob = await fetchResponse.blob();
        setGeneratedVideo(URL.createObjectURL(videoBlob));
        onNotify("Video generated successfully!", "success");
      }
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("entity was not found")) {
        setHasKey(false);
      }
      onNotify("Video generation failed. Veo requires a paid project API key.", "error");
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  if (hasKey === false) {
    return (
      <div className="max-w-4xl mx-auto mt-20 p-12 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-indigo-200 dark:border-indigo-900/30 text-center animate-fade-in shadow-2xl">
        <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <i className="fas fa-lock text-4xl"></i>
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Unlock Creative Studio</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
          Generative AI features require a personal API key from a paid GCP project. 
          Please link your key to access cinematic generation tools.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleOpenKeyPicker}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
          >
            Link Your API Key
          </button>
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
          >
            Billing Documentation <i className="fas fa-external-link-alt ml-2 text-xs"></i>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-[2.5rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="inline-flex items-center px-4 py-1.5 bg-white/10 rounded-full text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-6 backdrop-blur-md">
            <i className="fas fa-sparkles mr-2 text-yellow-300"></i> Powered by Gemini 3 & Veo
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Creative Hub</h1>
          <p className="text-indigo-200/70 text-lg font-medium max-w-xl">
            Generate stunning campus visuals and cinematic videos for your college presentations and events.
          </p>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute right-10 top-10 text-9xl text-white/5 opacity-10">
          <i className="fas fa-camera-retro"></i>
        </div>
      </div>

      {/* Tool Toggle */}
      <div className="flex bg-white dark:bg-slate-900 p-2 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 w-fit">
        <button
          onClick={() => setActiveTool('image')}
          className={`px-10 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all ${
            activeTool === 'image' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <i className="fas fa-image mr-3"></i> Image Gen
        </button>
        <button
          onClick={() => setActiveTool('video')}
          className={`px-10 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all ${
            activeTool === 'video' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <i className="fas fa-video mr-3"></i> Veo Animate
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Editor Side */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center">
            <span className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-4">
              <i className={activeTool === 'image' ? "fas fa-magic" : "fas fa-film"}></i>
            </span>
            {activeTool === 'image' ? 'Image Prompting' : 'Video Animation'}
          </h3>

          <div className="space-y-8">
            {activeTool === 'video' && (
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Starting Image</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-all overflow-hidden"
                >
                  {filePreview ? (
                    <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <i className="fas fa-cloud-upload-alt text-3xl text-slate-300 mb-2"></i>
                      <p className="text-xs font-bold text-slate-400">Upload Base Image</p>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>
            )}

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                {activeTool === 'image' ? 'Visual Description' : 'Motion Instructions (Optional)'}
              </label>
              <textarea
                value={activeTool === 'image' ? imagePrompt : videoPrompt}
                onChange={(e) => activeTool === 'image' ? setImagePrompt(e.target.value) : setVideoPrompt(e.target.value)}
                rows={4}
                className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 text-slate-900 dark:text-white font-medium resize-none transition-all"
                placeholder={activeTool === 'image' ? "A photorealistic render of the college main gate at sunset with vibrant colors..." : "Add a subtle camera zoom and wind moving the trees..."}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Aspect Ratio</label>
                <div className="flex gap-2">
                  {(activeTool === 'image' ? ['1:1', '16:9', '9:16', '4:3'] : ['16:9', '9:16']).map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => activeTool === 'image' ? setAspectRatio(ratio as any) : setVideoAspectRatio(ratio as any)}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black border transition-all ${
                        (activeTool === 'image' ? aspectRatio === ratio : videoAspectRatio === ratio)
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-indigo-200'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {activeTool === 'image' && (
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Resolution</label>
                  <div className="flex gap-2">
                    {['1K', '2K', '4K'].map(size => (
                      <button
                        key={size}
                        onClick={() => setImageSize(size as any)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black border transition-all ${
                          imageSize === size
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-indigo-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              disabled={isGenerating}
              onClick={activeTool === 'image' ? generateImage : generateVideo}
              className={`w-full py-6 rounded-[2rem] font-black text-lg transition-all transform active:scale-95 flex items-center justify-center space-x-4 disabled:opacity-50 disabled:cursor-not-allowed ${
                activeTool === 'image' ? 'bg-indigo-600 shadow-indigo-100' : 'bg-purple-600 shadow-purple-100'
              } text-white shadow-2xl dark:shadow-none`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="animate-pulse">{progressMessage || 'Synthesizing...'}</span>
                </>
              ) : (
                <>
                  <i className={activeTool === 'image' ? "fas fa-wand-magic-sparkles" : "fas fa-play"}></i>
                  <span>{activeTool === 'image' ? 'Generate Visual' : 'Animate with Veo'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result Side */}
        <div className="space-y-8">
           <div className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-10 h-[560px] flex flex-col items-center justify-center relative overflow-hidden group border border-slate-800">
             <div className="absolute top-8 left-8 z-20">
               <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-white/50 uppercase tracking-widest border border-white/5">
                 Studio Preview
               </span>
             </div>

             {isGenerating ? (
               <div className="text-center animate-fade-in z-10">
                 <div className="relative w-32 h-32 mx-auto mb-8">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
                       <i className={`fas ${activeTool === 'image' ? 'fa-atom' : 'fa-film'} text-4xl animate-pulse`}></i>
                    </div>
                 </div>
                 <h4 className="text-xl font-black text-white mb-2">{progressMessage}</h4>
                 <p className="text-slate-500 text-sm font-medium">This usually takes about {activeTool === 'image' ? '15s' : '45s'}...</p>
               </div>
             ) : (activeTool === 'image' ? generatedImage : generatedVideo) ? (
                <div className="w-full h-full animate-fade-in relative">
                   {activeTool === 'image' ? (
                     <img src={generatedImage!} alt="Generated" className="w-full h-full object-contain rounded-2xl" />
                   ) : (
                     <video src={generatedVideo!} controls autoPlay loop className="w-full h-full object-contain rounded-2xl" />
                   )}
                   <div className="absolute bottom-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                      <a 
                        href={activeTool === 'image' ? generatedImage! : generatedVideo!} 
                        download={`collegeflow-${activeTool}-${Date.now()}`}
                        className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center"
                      >
                        <i className="fas fa-download mr-2"></i> Download
                      </a>
                   </div>
                </div>
             ) : (
               <div className="text-center text-slate-600">
                 <i className="fas fa-image-portrait text-8xl mb-6 opacity-10"></i>
                 <p className="font-bold uppercase tracking-widest text-xs opacity-40">Output will appear here</p>
               </div>
             )}

             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40"></div>
           </div>

           <div className="bg-indigo-50 dark:bg-indigo-950/20 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30">
              <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">Pro Tip</h4>
              <p className="text-sm text-indigo-900/60 dark:text-indigo-300/60 leading-relaxed font-medium">
                {activeTool === 'image' 
                  ? "Be specific about lighting! Using terms like 'volumetric lighting', 'golden hour', or '4k cinematic render' significantly improves Gemini's output quality." 
                  : "Upload high-contrast images for Veo animation. Veo works best when there are clear foreground and background elements to distinguish motion depth."}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeHub;
