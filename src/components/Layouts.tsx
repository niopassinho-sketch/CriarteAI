import React from 'react';
import { Sparkles } from 'lucide-react';

export interface LayoutProps {
  post: any;
  theme: any;
  themeColor: string;
  scale: number;
  mainText: string;
  signature: string;
  imageFilter: string;
  getFilterStyle: () => string;
  dynamicTextColor: string;
  dynamicTextMuted: string;
  iaEnhancements?: any;
}

export const CoverLayout: React.FC<LayoutProps> = ({ post, scale, mainText, signature, imageFilter, getFilterStyle, iaEnhancements }) => (
  <>
    <img 
      src={post.imagem_url} 
      alt="Background" 
      className="absolute inset-0 w-full h-full object-cover opacity-60" 
      style={{ filter: imageFilter !== 'none' ? getFilterStyle() : (iaEnhancements?.filter && iaEnhancements.filter !== 'none' ? iaEnhancements.filter : 'none') }}
      crossOrigin="anonymous" 
      referrerPolicy="no-referrer" 
    />
    {iaEnhancements?.overlayEmoji && (
      <div className="absolute top-4 right-4 z-20" style={{ fontSize: `${64 * scale}px` }}>
        {iaEnhancements.overlayEmoji}
      </div>
    )}
    {/* Gradiente escuro na parte inferior para legibilidade */}
    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
    {imageFilter === 'classic-dark' && <div className="absolute inset-0 bg-black/40"></div>}
    
    <div className="relative z-10 flex flex-col items-center w-full h-full justify-end p-8 pb-16 text-center">
      <h2 className="mb-2 font-serif text-white drop-shadow-lg font-bold" style={{ fontFamily: "'Playfair Display', serif", fontSize: `${6.6 * 16 * scale}px` }}>
        {post.nome_homenageado}
      </h2>
      <div className="inline-flex items-center justify-center px-3 py-1 rounded-full backdrop-blur-sm mb-6 bg-white/10 border border-white/20">
        <p className="font-bold uppercase tracking-widest text-white/90" style={{ fontSize: `${1.87 * 16 * scale}px` }}>
          {post.tipo_ocasiao}
        </p>
      </div>
      <div className="relative w-full">
        <span className="absolute -top-4 -left-2 font-serif leading-none text-white/30" style={{ fontSize: `${6 * 16 * scale}px` }}>"</span>
        <p className={`font-medium leading-relaxed px-4 whitespace-pre-wrap text-white drop-shadow-sm`} style={{ fontSize: `${2.16 * 16 * scale}px` }}>
          {mainText}
        </p>
        {signature && (
          <p className="mt-8 text-white/90 drop-shadow-md" style={{ fontFamily: "'Caveat', cursive", fontSize: `${3.6 * 16 * scale}px` }}>
            {signature}
          </p>
        )}
        <span className="absolute -bottom-6 -right-2 font-serif leading-none text-white/30" style={{ fontSize: `${6 * 16 * scale}px` }}>"</span>
      </div>
    </div>
  </>
);

export const PolaroidLayout: React.FC<LayoutProps> = ({ post, themeColor, scale, mainText, signature, imageFilter, getFilterStyle, dynamicTextColor, iaEnhancements }) => (
  <div 
    className="w-full h-full flex flex-col p-4 pb-8"
    style={{ backgroundColor: themeColor || '#ffffff' }}
  >
    <div className="relative w-full h-full mb-4 overflow-hidden rounded-sm shadow-inner bg-slate-100">
      <img 
        src={post.imagem_url} 
        alt={post.nome_homenageado} 
        className="w-full h-full object-cover" 
        style={{ filter: imageFilter !== 'none' ? getFilterStyle() : (iaEnhancements?.filter && iaEnhancements.filter !== 'none' ? iaEnhancements.filter : 'none') }}
        crossOrigin="anonymous" 
        referrerPolicy="no-referrer" 
      />
      {iaEnhancements?.overlayEmoji && (
        <div className="absolute top-4 right-4 z-20" style={{ fontSize: `${64 * scale}px` }}>
          {iaEnhancements.overlayEmoji}
        </div>
      )}
      {imageFilter === 'classic-dark' && <div className="absolute inset-0 bg-black/40"></div>}
    </div>
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <h2 className={`mb-2 font-bold drop-shadow-lg ${themeColor ? dynamicTextColor : 'text-slate-800'}`} style={{ fontFamily: "'Caveat', cursive", fontSize: `${7.92 * 16 * scale}px` }}>
        {post.nome_homenageado}
      </h2>
      <p className={`font-bold uppercase tracking-widest whitespace-pre-wrap px-2 ${themeColor ? dynamicTextColor : 'text-slate-700'}`} style={{ fontSize: `${2.34 * 16 * scale}px` }}>
        {post.tipo_ocasiao}
      </p>
      <p className={`font-medium whitespace-pre-wrap px-2 ${themeColor ? dynamicTextColor : 'text-slate-700'}`} style={{ fontSize: `${2.3 * 16 * scale}px` }}>
        {mainText}
      </p>
      {signature && (
        <p className={`mt-8 ${themeColor ? dynamicTextColor : 'text-slate-800'}`} style={{ fontFamily: "'Caveat', cursive", fontSize: `${3.6 * 16 * scale}px` }}>
          {signature}
        </p>
      )}
    </div>
  </div>
);

export const SplitLayout: React.FC<LayoutProps> = ({ post, theme, themeColor, scale, mainText, signature, imageFilter, getFilterStyle, dynamicTextColor, iaEnhancements }) => (
  <div className="w-full h-full flex flex-row">
    <div className="w-1/2 h-full relative">
      <img 
        src={post.imagem_url} 
        alt="Background" 
        className="absolute inset-0 w-full h-full object-cover" 
        style={{ filter: imageFilter !== 'none' ? getFilterStyle() : (iaEnhancements?.filter && iaEnhancements.filter !== 'none' ? iaEnhancements.filter : 'none') }}
        crossOrigin="anonymous" 
        referrerPolicy="no-referrer" 
      />
      {iaEnhancements?.overlayEmoji && (
        <div className="absolute top-4 right-4 z-20" style={{ fontSize: `${64 * scale}px` }}>
          {iaEnhancements.overlayEmoji}
        </div>
      )}
      {imageFilter === 'classic-dark' && <div className="absolute inset-0 bg-black/40"></div>}
    </div>
    <div 
      className={`w-1/2 h-full flex flex-col items-center justify-center p-6 text-center ${themeColor ? '' : theme.solidBg}`}
      style={themeColor ? { backgroundColor: themeColor } : {}}
    >
      <h2 className={`mb-2 font-serif font-bold drop-shadow-lg ${themeColor ? dynamicTextColor : theme.solidText}`} style={{ fontFamily: "'Playfair Display', serif", fontSize: `${3.96 * 16 * scale}px` }}>
        {post.nome_homenageado}
      </h2>
      <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-white/20 mb-4">
        <p className={`font-bold uppercase tracking-widest ${themeColor ? dynamicTextColor : theme.solidText}`} style={{ fontSize: `${1.56 * 16 * scale}px` }}>
          {post.tipo_ocasiao}
        </p>
      </div>
      <p className={`font-medium leading-relaxed whitespace-pre-wrap ${themeColor ? dynamicTextColor : theme.solidText}`} style={{ fontSize: `${2.02 * 16 * scale}px` }}>
        {mainText}
      </p>
      {signature && (
        <p className={`mt-8 ${themeColor ? dynamicTextColor : theme.solidText} opacity-90`} style={{ fontFamily: "'Caveat', cursive", fontSize: `${3 * 16 * scale}px` }}>
          {signature}
        </p>
      )}
    </div>
  </div>
);

export const ClassicLayout: React.FC<LayoutProps> = ({ post, theme, themeColor, scale, mainText, signature, imageFilter, getFilterStyle, dynamicTextColor, iaEnhancements }) => (
  <>
    {!themeColor && (
      <>
        <div className={`absolute top-0 left-0 w-full h-2 ${theme.topBarGradient}`}></div>
        <div className={`absolute -top-20 -right-20 w-40 h-40 ${theme.blob1} rounded-full mix-blend-multiply filter blur-3xl opacity-50`}></div>
        <div className={`absolute -bottom-20 -left-20 w-40 h-40 ${theme.blob2} rounded-full mix-blend-multiply filter blur-3xl opacity-50`}></div>
      </>
    )}
    {theme.icons}

    <div className="relative z-10 flex flex-col items-center w-full h-full justify-center p-8 text-center">
      {post.imagem_url ? (
        <div className="relative mb-6">
          <div className={`absolute inset-0 bg-gradient-to-tr ${theme.imageRing} rounded-full blur-md opacity-40`}></div>
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg relative z-10">
            <img 
              src={post.imagem_url} 
              alt={post.nome_homenageado} 
              className="w-full h-full object-cover" 
              style={{ filter: imageFilter !== 'none' ? getFilterStyle() : (iaEnhancements?.filter && iaEnhancements.filter !== 'none' ? iaEnhancements.filter : 'none') }}
              referrerPolicy="no-referrer" 
              crossOrigin="anonymous" 
            />
            {iaEnhancements?.overlayEmoji && (
              <div className="absolute top-0 right-0 z-20" style={{ fontSize: `${64 * scale}px` }}>
                {iaEnhancements.overlayEmoji}
              </div>
            )}
            {imageFilter === 'classic-dark' && <div className="absolute inset-0 bg-black/40"></div>}
          </div>
        </div>
      ) : (
        <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mb-6 shadow-inner relative z-10">
          <Sparkles className={`w-8 h-8 ${theme.quoteColor}`} />
        </div>
      )}
      
      <h2 className={`mb-2 font-serif font-bold drop-shadow-lg ${themeColor ? dynamicTextColor : 'text-slate-900'}`} style={{ fontFamily: "'Playfair Display', serif", fontSize: `${6.6 * 16 * scale}px` }}>
        {post.nome_homenageado}
      </h2>
      
      <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full backdrop-blur-sm mb-6 border ${themeColor ? 'bg-white/20 border-white/30' : 'bg-white/60 border-slate-200/60'}`}>
        <p className={`font-bold uppercase tracking-widest ${themeColor ? dynamicTextColor : 'text-slate-600'}`} style={{ fontSize: `${1.87 * 16 * scale}px` }}>
          {post.tipo_ocasiao}
        </p>
      </div>
      
      <div className="relative w-full">
        <span className={`absolute -top-4 -left-2 font-serif leading-none ${themeColor ? dynamicTextColor : theme.quoteColor} opacity-50`} style={{ fontSize: `${7.2 * 16 * scale}px` }}>"</span>
        <p className={`font-medium leading-relaxed px-4 whitespace-pre-wrap ${themeColor ? dynamicTextColor : 'text-slate-700'}`} style={{ fontSize: `${2.16 * 16 * scale}px` }}>
          {mainText}
        </p>
        {signature && (
          <p className={`mt-2 ${themeColor ? dynamicTextColor : 'text-slate-800'}`} style={{ fontFamily: "'Caveat', cursive", fontSize: `${3.6 * 16 * scale}px` }}>
            {signature}
          </p>
        )}
        <span className={`absolute -bottom-6 -right-2 font-serif leading-none ${themeColor ? dynamicTextColor : theme.quoteColor} opacity-50`} style={{ fontSize: `${7.2 * 16 * scale}px` }}>"</span>
      </div>
    </div>
  </>
);
