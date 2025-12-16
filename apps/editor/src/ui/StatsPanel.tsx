import React, { useEffect, useState } from 'react';

interface Stats {
  fps: number;
  triangles: number;
  geometries: number;
  textures: number;
  drawCalls: number;
  memory: {
    geometries: number;
    textures: number;
  };
}

export function StatsPanel() {
  const [stats, setStats] = useState<Stats>({
    fps: 60,
    triangles: 0,
    geometries: 0,
    textures: 0,
    drawCalls: 0,
    memory: {
      geometries: 0,
      textures: 0,
    },
  });

  // Simulate updating stats (in a real app, this would come from your renderer)
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, you would get these values from your WebGL renderer
      // For example: const stats = renderer.getStats();
      setStats({
        fps: Math.round(Math.random() * 30 + 30), // Random FPS between 30-60 for demo
        triangles: Math.floor(Math.random() * 100000),
        geometries: Math.floor(Math.random() * 100),
        textures: Math.floor(Math.random() * 50),
        drawCalls: Math.floor(Math.random() * 1000),
        memory: {
          geometries: Math.floor(Math.random() * 100) + 10,
          textures: Math.floor(Math.random() * 50) + 5,
        },
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatMemory = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    if (bytes >= 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    }
    return bytes + ' B';
  };

  return (
    <div className="text-xs font-mono bg-gray-800 text-green-400 p-2">
      <div className="grid grid-cols-2 gap-1">
        <div className="flex justify-between">
          <span>FPS:</span>
          <span className={stats.fps < 50 ? 'text-yellow-400' : 'text-green-400'}>
            {stats.fps}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Triangles:</span>
          <span>{formatNumber(stats.triangles)}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Geometries:</span>
          <span>{stats.geometries}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Textures:</span>
          <span>{stats.textures}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Draw Calls:</span>
          <span>{stats.drawCalls}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Geometry Mem:</span>
          <span>{formatMemory(stats.memory.geometries * 1024)}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Texture Mem:</span>
          <span>{formatMemory(stats.memory.textures * 1024 * 1024)}</span>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span>Renderer:</span>
          <span className="text-blue-400">WebGL 2.0</span>
        </div>
        <div className="flex justify-between items-center">
          <span>GPU:</span>
          <span className="text-blue-400">WebGL2 (Hardware)</span>
        </div>
      </div>
    </div>
  );
}