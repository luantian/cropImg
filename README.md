# cropimg 图片裁剪
### 一个原生js编写的图片裁剪插件

```javascript
    $_$Crop({
        container: document.getElementById('crop'),
        image_src: 'timg.jpeg',
        output: function(data) {
            console.log('data: ', data);
            console.log('blob: ', data.blob);
        }
    });
``` 
### 配置参数
| param | type |  default  |   need   | description  |
|  :----:  |  :----:       |  :----:     |  :----:  |  :----: | 
| container|DOM|null|true|加载树结构的dom节点|
| output|Function|null|true|裁剪完成后的回调函数|
|cover_width|  Number | window.width * 0.5 | false |裁剪框的宽度
|cover_height|  Number | window.height * 0.5 | false |裁剪框的高度
|image_src|  String | null | true |图片的链接地址|
