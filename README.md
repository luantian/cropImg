# cropimg 图片裁剪
### 一个原生js编写的图片裁剪插件

### 使用实例, * 表示必传参数
```javascript
    $_$Crop({
        container: document.getElementById('crop'),
        image_src: 'timg.jpeg',
        cover_width: 200,
        cover_height: 100,
        output: function(data) {
            console.log('data: ', data);
            console.log('blob: ', data.blob);
        }
    });
``` 
### 配置参数
| param        | type          |  default                              |   need   | description                                                  |
|  :----:      |  :----:       |  :----:                               |  :----:  |  :----:                                                      | 
| container    | DOM           |   null                                |   true   | 加载树结构的dom节点                                            |
| output    |   Function       |   null                                |   true   |裁剪完成后的回调函数                                            |
|cover_width|  Number | window.width * 0.5 | false |
|cover_height|  Number | window.height * 0.5 | false |
|image_src|  String | 图片的链接地址 | false |
