import fs from 'fs';

// Simple HTML analysis script to extract selectors from saved HTML files

const htmlFiles = [
  '/home/engine/project/mamba-dialogs-page.html',
  '/home/engine/project/page-after-login.html',
  '/home/engine/project/page-main.html',
];

const analysis = {
  dialogs: {},
  messages: {},
  likes: {},
};

function analyzeHTML(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ File not found: ${filePath}`);
    return null;
  }
  
  try {
    const html = fs.readFileSync(filePath, 'utf-8');
    
    console.log(`\n📄 Analyzing: ${filePath}`);
    console.log(`File size: ${(html.length / 1024).toFixed(2)} KB\n`);
    
    // Extract key patterns
    const patterns = {
      listItems: (html.match(/<li[^>]*>/g) || []).length,
      buttons: (html.match(/<button[^>]*>/g) || []).length,
      inputs: (html.match(/<input[^>]*>/g) || []).length,
      textareas: (html.match(/<textarea[^>]*>/g) || []).length,
      links: (html.match(/<a[^>]*>/g) || []).length,
      divs: (html.match(/<div[^>]*>/g) || []).length,
      spans: (html.match(/<span[^>]*>/g) || []).length,
      images: (html.match(/<img[^>]*>/g) || []).length,
      svgs: (html.match(/<svg[^>]*>/g) || []).length,
    };
    
    console.log('Element counts:');
    Object.entries(patterns).forEach(([key, count]) => {
      console.log(`  ${key}: ${count}`);
    });
    
    // Extract unique classes
    const classMatches = html.match(/class="[^"]*"/g) || [];
    const classes = new Set();
    classMatches.forEach(match => {
      const classList = match.replace('class="', '').replace('"', '').split(' ');
      classList.forEach(cls => {
        if (cls.length > 0 && cls.length < 20) {
          classes.add(cls);
        }
      });
    });
    
    console.log(`\nUnique classes: ${classes.size}`);
    const classArray = Array.from(classes).sort().slice(0, 30);
    console.log('Sample classes:');
    classArray.forEach(cls => console.log(`  .${cls}`));
    
    // Look for specific keywords
    const keywords = {
      message: html.toLowerCase().match(/message/gi)?.length || 0,
      dialog: html.toLowerCase().match(/dialog/gi)?.length || 0,
      chat: html.toLowerCase().match(/chat/gi)?.length || 0,
      like: html.toLowerCase().match(/like/gi)?.length || 0,
      send: html.toLowerCase().match(/send/gi)?.length || 0,
      input: html.toLowerCase().match(/input/gi)?.length || 0,
    };
    
    console.log(`\nKeyword matches:`);
    Object.entries(keywords).forEach(([key, count]) => {
      if (count > 0) console.log(`  "${key}": ${count}`);
    });
    
    // Extract some link hrefs
    const hrefMatches = html.match(/href="[^"]*"/g) || [];
    const hrefs = new Set();
    hrefMatches.forEach(match => {
      const href = match.replace('href="', '').replace('"', '');
      if (href.length < 100 && !href.startsWith('http') && !href.includes('manifest')) {
        hrefs.add(href);
      }
    });
    
    console.log(`\nLocal hrefs found: ${hrefs.size}`);
    const hrefArray = Array.from(hrefs).sort();
    if (hrefArray.length > 0) {
      console.log('Sample hrefs:');
      hrefArray.slice(0, 15).forEach(href => console.log(`  ${href}`));
    }
    
    return {
      elements: patterns,
      classes: Array.from(classes),
      keywords,
      hrefs: Array.from(hrefs),
    };
  } catch (error) {
    console.error(`Error analyzing ${filePath}: ${error.message}`);
    return null;
  }
}

console.log('🔍 Analyzing saved HTML files...');
console.log('='.repeat(70));

htmlFiles.forEach(file => {
  const result = analyzeHTML(file);
  if (result) {
    const key = file.split('/').pop().split('-')[1] || 'other';
    if (key.includes('dialog')) {
      analysis.dialogs = result;
    } else if (key.includes('message')) {
      analysis.messages = result;
    } else if (key.includes('like')) {
      analysis.likes = result;
    }
  }
});

console.log('\n' + '='.repeat(70));
console.log('📊 Summary');
console.log('='.repeat(70));
console.log(JSON.stringify(analysis, null, 2));

// Save analysis
fs.writeFileSync('/home/engine/project/html-analysis.json', JSON.stringify(analysis, null, 2));
console.log('\n✅ Analysis saved to html-analysis.json');
