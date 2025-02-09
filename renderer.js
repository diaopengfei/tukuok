const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 选择图片目录
async function selectImageDirectory() {
    try {
        const directory = await ipcRenderer.invoke('select-directory');
        return directory;
    } catch (err) {
        throw err;
    }
}

// 递归读取目录中的图片文件
function readImageFiles(directory) {
    return new Promise((resolve, reject) => {
        fs.readdir(directory, { withFileTypes: true }, (err, files) => {
            if (err) {
                reject(err);
            } else {
                const imageFiles = [];
                const promises = files.map(file => {
                    const fullPath = path.join(directory, file.name);
                    if (file.isDirectory()) {
                        return readImageFiles(fullPath).then(subFiles => {
                            imageFiles.push(...subFiles.map(subFile => path.join(file.name, subFile)));
                        });
                    } else {
                        const ext = path.extname(file.name).toLowerCase();
                        if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                            imageFiles.push(file.name);
                        }
                        return Promise.resolve();
                    }
                });
                Promise.all(promises).then(() => {
                    resolve(imageFiles);
                }).catch(reject);
            }
        });
    });
}

function displayThumbnails(images, directory) {
    const container = document.getElementById('image-container');
    container.innerHTML = '';

    let row;
    const thumbnailWidth = 100; // 缩略图宽度
    const thumbnailHeight = 100; // 缩略图高度
    const minImagesPerRow = 5; // 每行最少展示的图片数量

    // 计算每行可展示的图片数量
    const windowWidth = window.innerWidth;
    const imagesPerRow = Math.max(Math.floor(windowWidth / thumbnailWidth), minImagesPerRow);

    const processImage = async (image, index) => {
        if (index % imagesPerRow === 0) {
            row = document.createElement('div');
            row.classList.add('image-row');
            container.appendChild(row);
        }
        const img = document.createElement('img');
        const fullImagePath = path.join(directory, image);
        const thumbnailPath = path.join(__dirname, 'thumbnails', image);

        try {
            // 检查是否已经存在缩略图
            if (fs.existsSync(thumbnailPath)) {
                const thumbnailBlob = new Blob([fs.readFileSync(thumbnailPath)], { type: 'image/jpeg' });
                const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
                img.src = thumbnailUrl;
            } else {
                // 使用 sharp 库生成缩略图
                const thumbnailBuffer = await sharp(fullImagePath)
                    .resize(thumbnailWidth, thumbnailHeight) // 调整图片尺寸
                    .toBuffer(); // 转换为 Buffer
                // 保存缩略图
                fs.mkdirSync(path.join(__dirname, 'thumbnails'), { recursive: true });
                fs.writeFileSync(thumbnailPath, thumbnailBuffer);
                const thumbnailBlob = new Blob([thumbnailBuffer], { type: 'image/jpeg' });
                const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
                img.src = thumbnailUrl;
            }
        } catch (err) {
            console.error(`处理图片 ${fullImagePath} 时出错:`, err);
            img.src = fullImagePath; // 如果处理出错，使用原始图片路径
        }
        img.classList.add('thumbnail');
        img.addEventListener('click', () => showFullImage(fullImagePath));
        row.appendChild(img);
    };

    const promises = images.map((image, index) => processImage(image, index));
    Promise.all(promises).catch(err => console.error('处理图片时出错:', err));
}

function showFullImage(imagePath) {
    const fullImageContainer = document.createElement('div');
    fullImageContainer.classList.add('full-image-container');
    const fullImage = document.createElement('img');
    fullImage.src = imagePath;
    fullImage.classList.add('full-image');
    const closeButton = document.createElement('button');
    closeButton.textContent = '关闭';
    closeButton.style.position = 'absolute';
    closeButton.style.right='100px';
    closeButton.addEventListener('click', () => {
        fullImageContainer.remove();
    });

    // 添加标签输入框和保存按钮
    const tagInput = document.createElement('input');
    tagInput.placeholder = '输入标签';
    const saveTagButton = document.createElement('button');
    saveTagButton.textContent = '保存标签';
    saveTagButton.addEventListener('click', () => {
        const tag = tagInput.value;
        if (tag) {
            // 保存标签到文件
            const tagsFilePath = path.join(__dirname, 'tags.json');
            let tags = {};
            try {
                const tagsData = fs.readFileSync(tagsFilePath, 'utf8');
                tags = JSON.parse(tagsData);
            } catch (error) {
                // 如果文件不存在或读取失败，使用空对象
            }
            if (!tags[imagePath]) {
                tags[imagePath] = [];
            }
            tags[imagePath].push(tag);
            fs.writeFileSync(tagsFilePath, JSON.stringify(tags));
            alert('标签保存成功');
        }
    });

    fullImageContainer.appendChild(fullImage);
    fullImageContainer.appendChild(closeButton);
    fullImageContainer.appendChild(tagInput);
    fullImageContainer.appendChild(saveTagButton);
    document.body.appendChild(fullImageContainer);
}

async function main() {
    try {
        let directory;
        // 尝试获取保存的路径
        try {
            const config = fs.readFileSync('config.json', 'utf8');
            directory = JSON.parse(config).directory;
        } catch (error) {
            // 如果文件不存在或读取失败，重新选择目录
            directory = await selectImageDirectory();
        }
        const images = await readImageFiles(directory);
        displayThumbnails(images, directory);
    } catch (err) {
        console.error(err);
    }
}

main();

// 监听目录变化，实时刷新缩略图
ipcRenderer.on('update-directory', (event, newDirectory) => {
    main();
});

document.getElementById('filter-button').addEventListener('click', async () => {
    const tagFilter = document.getElementById('tag-filter').value;
    if (tagFilter) {
        try {
            const tagsFilePath = path.join(__dirname, 'tags.json');
            const tagsData = fs.readFileSync(tagsFilePath, 'utf8');
            const tags = JSON.parse(tagsData);
            const filteredImages = [];
            for (const [imagePath, imageTags] of Object.entries(tags)) {
                if (imageTags.includes(tagFilter)) {
                    filteredImages.push(path.basename(imagePath));
                }
            }
            const directory = await selectImageDirectory();
            displayThumbnails(filteredImages, directory);
        } catch (error) {
            console.error('筛选照片时出错:', error);
        }
    }
});