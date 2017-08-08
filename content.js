class Zelp {
    constructor() {
        this.dishIdRegex = /\/zefr\/(\d+)\/(\d+)/;
        this.restaurantIdRegex = /\/zefr\/(\d+)/;
        this.restaurant = null;
        this.dishes = [];
        this.restaurantList = $('#r-list a');
        this.menuItems = $('#menu a');

    }

    getRestaurants() {
        this.restaurants = this.restaurantList.map((index, item) => {
            const restaurant = this.getRestaurantInfo($(item).clone());

            chrome.storage.local.get([restaurant.id], (comment) => {
                if(comment[restaurant.id]) {
                    this.addComment($(item), comment[restaurant.id], restaurant);
                    restaurant.comment = comment[restaurant.id];
                }
            });

            return restaurant;
        });
    }

    getDishes() {
        this.dishes = this.menuItems.map((index, item) => {
            const dish = this.getDishInfo($(item).clone());

            chrome.storage.local.get([dish.id], (comment) => {
                if(comment[dish.id]) {
                    this.addComment($(item), comment[dish.id], dish);
                    dish.comment = comment[dish.id];
                }
            });

            return dish;
        });
    }

    addComment($item, comment, dish) {
        if(comment) {
            const $deleteLink = $('<a class="delete-link">x</a>').on('click', () => {
                this.removeComment(dish, $item);
                this.saveComment(dish, null);
            });
            const $comment = $(`<p class="comment">${comment}</p>`);
            $deleteLink.prependTo($comment);
            $item.parent().append($comment);
        }
    }

    getDishInfo($dish) {
        // remove the prive <em> tag
        $dish.find('em').remove();
        const dishIdMatches = $dish.attr('href').match(this.dishIdRegex);
        const id = (dishIdMatches) ? dishIdMatches[2] : null;
        const name = $dish.text().trim();
        return { id, name };
    }


    getRestaurantInfo($restaurant) {
        const restIdMatches = $restaurant.attr('href').match(this.restaurantIdRegex);
        const id = (restIdMatches) ? restIdMatches[1] : null;
        const name = $restaurant.find('h4').text().trim();
        return { id, name };
    }

    toggleCommentBox(dish, $item) {
        dish.open = !dish.open;

        if(dish.open) {
            this.createForm(dish, $item);
            this.removeComment(dish, $item);
        } else {
            this.removeForm($item);
        }
    }

    removeForm($item) {
        $item.parent().find('.comment-form').remove();
    }

    removeComment(dish, $item) {
        $item.parent().find('.comment').remove();
    }

    saveComment(dish, comment) {
        chrome.storage.local.set({ [dish.id]: comment });
        dish.comment = comment;
    }

    createForm(dish, $item) {
        const $cancelBtn = $('<a class="cancel-link">Cancel</a>').on('click', () => {
            this.toggleCommentBox(dish, $item);
            this.addComment($item, dish.comment, dish);
        });

        const $saveBtn = $('<button class="save-btn">Save</button>').on('click', () => {
            let comment = $item.parent().find('.comments').val();
            this.saveComment(dish, comment);
            this.toggleCommentBox(dish, $item);
            this.addComment($item, comment, dish);
        });

        const $buttons = $('<div class="form-buttons" />')
            .append($cancelBtn)
            .append($saveBtn);

        const $textArea = $('<textarea class="comments" />');
        if(dish.comment) {
            $textArea.val(dish.comment);
        }

        const $form = $('<div class="comment-form" />')
            .append($textArea)
            .append($buttons);

        $item.parent().append($form);
    }

    addCommentIcons() {
        this.restaurantList.map((index, item) => {
            const icon = $('<img />')
                .attr('src', chrome.extension.getURL('pencil.svg'))
                .attr('class', 'pencil').
                on('click', () => this.toggleCommentBox(this.restaurants[index], $(item)));
            $(item).parent().append(icon);
        });

        this.menuItems.map((index, item) => {
            const icon = $('<img />')
                .attr('src', chrome.extension.getURL('pencil.svg'))
                .attr('class', 'pencil').
                on('click', () => this.toggleCommentBox(this.dishes[index], $(item)));
            $(item).parent().append(icon);
        });
    }

    process() {
        this.getRestaurants();
        this.getDishes();
        this.addCommentIcons();
    }
}

const zelp = new Zelp();
zelp.process();
