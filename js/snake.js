class Controller {
    static KEY_ENTER = 13; // 暂停功能
    static Key_ESC = 27; // 停止游戏
    static KEYS = [13, 27];
    constructor(snake) {
        this.snake = snake;
    }
    handleEvent(e) {
        if (e.keyCode == Controller.KEY_ENTER) {
            this.snake.pause();
        }
    }
}
class Food {
    static RED = 1;
    static GREEN = 2;
    static PURPLE = 3;
    static PINK = 4;
    static scoreData = {
        "1": 50,
        "2": 30,
        "3": 20,
        "4": 10
    };
    constructor(pos, color, client) {
        this.pos = pos;
        this.client = client;
        this.client.foodPosition = this.pos;
        this.color = color;
        this.setColorAndScore(this.color);
        client.food = this;
    }
    setColorAndScore(color) {
        $("#s" + this.pos).addClass('food' + color);
        this.score = Food.scoreData[color];
    }
}
class Snake {
    static UP = 1;
    static DOWN = 2;
    static LEFT = 3;
    static RIGHT = 4;
    constructor(len, pos, dir, client) {
        this.paused = false;
        this.flashTimeDuration = 70;
        this.liveFlag = true;
        this.client = client;
        this.dir = dir;
        this.initData(len, pos);
        this.display();
        let self = this;
        // 头部闪烁特效
        this.flashTimer = setInterval(function() {
            $("#s" + self.data[0]).toggleClass('snakeHead');
        }, 100);
        this.moveTimer = setInterval(function() {
            self.move();
        }, 300);
    }
    pause() {
        if (this.paused) {
            // 后开启
            let self = this;
            this.moveTimer = setInterval(function() {
                self.move();
            }, 300);
            // 改变状态
            this.paused = false;
        } else {
            clearInterval(this.moveTimer);
            this.paused = true;
        }
    }
    dead() {
        this.liveFlag = false;
        clearInterval(this.moveTimer);
        clearInterval(this.flashTimer);
        $("#game").css("display", "none");
        $("#over").css("display", "block");
    }
    meetFood(pos) {
        return pos == this.client.foodPosition;
    }
    move() {
        // 清除原样式
        let tempData = this.data;
        $("#s" + tempData[0]).removeClass('snakeHead');
        tempData.forEach(function(item) {
            $("#s" + item).removeClass('snake');
        })

        // 更新数据
        let nextHead = -1;
        let topSide = this.dir == Snake.UP && (nextHead = this.data[0] - this.client.rowNum) && nextHead < 0;
        let bottomSide = this.dir == Snake.DOWN && (nextHead = this.data[0] + this.client.rowNum) && nextHead > this.client.totalNum;
        let leftSide = this.dir == Snake.LEFT && (nextHead = this.data[0] - 1) && nextHead % this.client.rowNum == 0;
        let rightSide = this.dir == Snake.RIGHT && (nextHead = this.data[0] + 1) && nextHead % this.client.rowNum == 0;
        let hitSelf = this.data.includes(nextHead);
        if (topSide || bottomSide || leftSide || rightSide || hitSelf) {
            this.dead();
        }
        if (nextHead > 0) {
            this.data.unshift(nextHead);
            this.meetFood(nextHead) ? this.client.changeFoodPos() : this.data.pop();
        }
        // 更新样式
        this.display();

    }
    initData(len, pos) {
        this.data = [];
        for (var i = 0; i < len; i++) this.data.push(pos + i);
    }
    display() {
        for (var i = 0; i < this.data.length; i++) {
            $("#s" + this.data[i]).addClass('snake');
        }
    }
    handleEvent(e) {
        switch (e.keyCode) {
            case 37:
                this.dir != 4 && (this.dir = 3)
                break;
            case 38:
                this.dir != 2 && (this.dir = 1);
                break;
            case 39:
                this.dir != 3 && (this.dir = 4);
                break;
            case 40:
                this.dir != 1 && (this.dir = 2);
                break;
            default:
                console.log("没有对应的按键！")
        }
    }
}

class GameCient {
    constructor(squareSize, squareNumPerRow) {
        this.gameScore = 0;
        this.rowNum = squareNumPerRow
        this.squareSize = squareSize;
        this.totalNum = squareNumPerRow ** 2;
        this.appWidth = (squareSize + 4) * squareNumPerRow;
        // 初始化界面
        this.initUI(this.appWidth);
        this.snake = new Snake(2, this.totalNum / 2 + squareNumPerRow / 2, Snake.LEFT, this);
        this.changeFoodPos();
        this.controller = new Controller(this.snake);
        let self = this;
        $(document).keydown(function(event) {
            Controller.KEYS.includes(event.keyCode) ? self.controller.handleEvent(event) : self.snake.handleEvent(event);
        });

    }
    changeDashData() {
        $("#snakeLen").html(this.snake.data.length);
        $("#gameScore").html(this.gameScore);
    }
    changeFoodPos() {
        // 清除原来样式
        if (this.foodPosition) {
            this.gameScore = this.gameScore + this.food.score;
            this.changeDashData();
            $("#s" + this.foodPosition).removeClass('food' + this.food.color)
        }
        // 获得所有小格子的坐标
        let allPositions = [];
        for (var i = 0; i < this.totalNum; i++) {
            if (this.snake.data.includes(i)) continue;
            allPositions.push(i);
        }
        let newPos = Math.floor((Math.random() * allPositions.length) + 1);
        let newColor = Math.floor((Math.random() * 4) + 1);
        new Food(newPos, newColor, this);
    }
    initUI(appWidth) {
        $("#app").css("width", appWidth + 8 + "px");
        $("#dash").css("width", appWidth + "px");
        $("#game").css("width", appWidth + "px");
        $("#over").css("height", appWidth + "px");
        $("#over").css("lineHeight", appWidth - 35 + "px");
        for (var i = 0; i < this.totalNum; i++) {
            let square = $("<div id='s" + i + "' class='square' style='width:" + this.squareSize + "px;height:" + this.squareSize + "px'></div>");
            $("#game").append(square);
        }
        let temp = $("#game").css("height");
    }
}

$(function() {
    new GameCient(6, 30);
})