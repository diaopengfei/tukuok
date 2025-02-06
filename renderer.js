const { dialog } = require('electron').remote;
const fs = require('fs');
const path = require('path');

// 选择图片目录
function selectImageDirectory() {
    return new Promise((resolve, reject) => {
        dialog.showOpenDialog({
            properties: ['openDirectory']
        }).then(result => {
            if (!result.canceled) {
                resolve(result.filePaths[0]);
            } else {
                reject(new Error('用户取消了选择'));
            }
        }).catch(err => {
            reject(err);
        });
    });
}

// 读取目录中的图片文件
function readImageFiles(directory) {
    return new Promise((resolve, reject) => {
        fs.readdir(directory, (err, files) => {
            if (err) {
                reject(err);
            } else {
                const imageFiles = files.filter(file => {
                    const ext = path.extname(file).toLowerCase();
                    return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
                });
                resolve(imageFiles);
            }
        });
    });
}

// 显示图片
function displayImages(images, directory) {
    const container = document.getElementById('image-container');
    container.innerHTML = '';

    images.forEach(image => {
        const img = document.createElement('img');
        img.src = path.join(directory, image);
        container.appendChild(img);
    });
}

// 主函数
async function main() {
    try {
        const directory = await selectImageDirectory();
        const images = await readImageFiles(directory);
        displayImages(images, directory);
    } catch (err) {
        console.error(err);
    }
}

// 启动主函数
main();