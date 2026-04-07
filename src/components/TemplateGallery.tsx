import React from 'react';
import { ClassicLayout, CoverLayout, PolaroidLayout, SplitLayout, LayoutProps } from './Layouts';

interface TemplateGalleryProps {
  selectedLayout: string;
  onSelectLayout: (layout: string) => void;
  // Props necessárias para renderizar os layouts
  layoutProps: Omit<LayoutProps, 'scale'>;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ selectedLayout, onSelectLayout, layoutProps }) => {
  const layouts = [
    { id: 'classic', name: 'Clássico', Component: ClassicLayout },
    { id: 'cover', name: 'Capa', Component: CoverLayout },
    { id: 'polaroid', name: 'Polaroid', Component: PolaroidLayout },
    { id: 'split', name: 'Split', Component: SplitLayout },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {layouts.map(({ id, name, Component }) => (
        <div 
          key={id}
          className={`cursor-pointer border-4 rounded-lg overflow-hidden ${selectedLayout === id ? 'border-blue-500' : 'border-transparent'}`}
          onClick={() => onSelectLayout(id)}
        >
          <div className="w-full aspect-square bg-gray-100 relative overflow-hidden">
            <div 
              className="absolute inset-0 origin-top-left"
              style={{ transform: 'scale(0.2)', width: '500%', height: '500%' }}
            >
              <Component {...layoutProps} scale={1} />
            </div>
          </div>
          <p className="text-center text-sm font-medium p-2">{name}</p>
        </div>
      ))}
    </div>
  );
};
