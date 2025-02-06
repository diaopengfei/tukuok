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

// 显示图片缩略图
function displayThumbnails(images, directory) {
    const container = document.getElementById('image-container');
    container.innerHTML = '';

    let row;
    images.forEach((image, index) => {
        if (index % 5 === 0) {
            row = document.createElement('div');
            row.classList.add('image-row');
            container.appendChild(row);
        }
        const img = document.createElement('img');
        img.src = path.join(directory, image);
        img.classList.add('thumbnail');
        img.addEventListener('click', () => showFullImage(path.join(directory, image)));
        row.appendChild(img);
    });
}

// 显示放大的图片
function showFullImage(imagePath) {
    const fullImageContainer = document.createElement('div');
    fullImageContainer.classList.add('full-image-container');
    const fullImage = document.createElement('img');
    fullImage.src = imagePath;
    fullImage.classList.add('full-image');
    const closeButton = document.createElement('button');
    closeButton.textContent = '关闭';
    closeButton.addEventListener('click', () => {
        fullImageContainer.remove();
    });
    fullImageContainer.appendChild(fullImage);
    fullImageContainer.appendChild(closeButton);
    document.body.appendChild(fullImageContainer);
}

// 主函数
async function main() {
    try {
        const directory = await selectImageDirectory();
        const images = await readImageFiles(directory);
        displayThumbnails(images, directory);
    } catch (err) {
        console.error(err);
    }
}

// 启动主函数
main();