// Quick test for export functionality
const testExport = async () => {
  const testData = {
    videos: [
      {
        id: 'test123',
        name: 'test-video.mp4',
        path: '/mnt/d/adolfocesar/code/new_prepare/video-prepare/server/uploads/test.mp4',
        startTime: 0,
        tagName: undefined
      }
    ],
    globalSettings: {
      fps: 24,
      totalFrames: 120
    },
    outputPath: 'C:\\Users\\TestUser\\Downloads\\output'
  };

  try {
    const response = await fetch('http://localhost:3005/api/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('Export test result:', result);
  } catch (error) {
    console.error('Export test failed:', error);
  }
};

// Test path conversion locally
const testPath = 'C:\\Users\\TestUser\\Downloads\\output';
const converted = testPath.replace(/^([A-Z]):\\/, (match, drive) => `/mnt/${drive.toLowerCase()}/`).replace(/\\/g, '/');
console.log('Path conversion test:');
console.log('Original:', testPath);
console.log('Converted:', converted);

console.log('\nTo test export, make sure you have a video uploaded first, then run:');
console.log('node test-export.js');