// Movie Cards Component
Vue.component('moviecards', {
    // create template for movie cards, image tag, card-body and all its necessary tags. Bind any necesarry vue elements to those html tags
    template: `
        <div class="card" style="width: 18rem;">
            <img v-bind:src="'https://image.tmdb.org/t/p/w500' + movieobj.poster_path" class="card-img-top" alt="Movie Poster Image">
            <div class="card-body">
                <h5 class="card-title">{{ movieobj.title }}</h5>
                <p class="card-text">{{ movieobj.overview }}</p>

                <button class="btn btn-primary" @click="addTicket('Child')">Child Ticket</button>
                <button class="btn btn-primary m-2" @click="addTicket('Adult')">Adult Ticket</button>
            </div>
        </div>
    `,
    // movieobj prop that is passed to the component from the for loop in the html moviecards tag
    props: ['movieobj'],

    methods: {
        // Method to handle adding a ticket type
        addTicket(ticketType) {
            // Emit event with the movie object and ticket type that is passed to the main vue app for handling
            this.$emit('ticket-added', { movie: this.movieobj, ticketType });
        }
    }
}); // end of movie cards component

Vue.component('cart', {
    // create template for cart table and its necessary tags. Bind any necesarry vue elements to those html tags
    template: `
        <div v-if="cart.length > 0" class="mt-5">
            <h3>Your Cart</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Movie</th>
                        <th>Adult Tickets</th>
                        <th>Children's Tickets</th>
                        <th>Subtotal</th>
                        <th>Remove</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(ticket, index) in cart" :key="ticket.movie.id">
                        <td>{{ ticket.movie.title }}</td>
                        <td>
                            {{ ticket.adultQuantity }}
                            <button @click="subtractTicket(ticket, 'Adult')" class="btn btn-secondary btn-sm ml-2">-</button>
                        </td>
                        <td>
                            {{ ticket.childQuantity }}
                            <button @click="subtractTicket(ticket, 'Child')" class="btn btn-secondary btn-sm ml-2">-</button>
                        </td>
                        <td>{{ '$' + ticket.subtotal.toFixed(2) }}</td>
                        <td>
                            <button @click="removeFromCart(index)" class="btn btn-danger">Remove</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div>
                <h5>Adult Total: {{ '$' + adultTotal.toFixed(2) }}</h5>
                <h5>Children Total: {{ '$' + childrenTotal.toFixed(2) }}</h5>
                <h5>Grand Total: {{ '$' + totalPrice.toFixed(2) }}</h5>
            </div>
        </div>
        <div v-else>
            <!--  if cart is empty display message-->
            <p>Cart is currently empty. Please add tickets.</p>
        </div>
    `,
    //cart array, and ticketPrices prop that is passed to the component from the v-bind in the html cart tag 
    props: {
        cart: Array,
        ticketPrices: {
            type: Object,
            default: () => ({ Adult: 12, Child: 8 })
        }
    },
    // methods automatically recalculated by Vue whenever their dependent data changes
    computed: {
        // checks to see if the ticket added was an adult ticket
        adultTotal() {
            // if ticketPrices returns null/undefined return 0
            if (!this.ticketPrices) {
                return 0;
            }
            // otherwise iterate over each adult ticket in the cart with reduce, get the total cost of all adult tickets that are in the cart array
            return this.cart.reduce((total, ticket) => {
                return total + (ticket.adultQuantity * this.ticketPrices.Adult);
            }, 0);
        },
        // checks to see if the ticket added was a child ticket
        childrenTotal() {
            // if ticketPrices returns null/undefined return 0
            if (!this.ticketPrices) {
                return 0;
            }
            // otherwise iterate over each child ticket in the cart with reduce, get the total cost of all child tickets that are in the cart array
            return this.cart.reduce((total, ticket) => {
                return total + (ticket.childQuantity * this.ticketPrices.Child);
            }, 0);
        },
        // actively updates the total price of the cart
        totalPrice() {
            // iterates over each ticket in the cart, and gets the total cost of all the tickets in the cart array. 
            return this.cart.reduce((total, ticket) => {
                return total + ticket.subtotal;
            }, 0);
        }
    },
    methods: {
        //  method triggered from click event that removes a ticket object from the cart based off the objects index
        removeFromCart(index) {
            // emits event to parent component and passes the index of the object to the parent vue app
            this.$emit('remove-from-cart', index);
        },
        // method to subtract the removed ticket from the totals
        subtractTicket(ticket, type) {
            // checks if adult ticket and if theres at least one
            if (type === 'Adult' && ticket.adultQuantity > 0) {
                // Decrease the adult ticket quantity by 1
                Vue.set(ticket, 'adultQuantity', ticket.adultQuantity - 1);
                //if child ticket and if theres at least one
            } else if (type === 'Child' && ticket.childQuantity > 0) {
                // Decrease the child ticket quantity by 1
                Vue.set(ticket, 'childQuantity', ticket.childQuantity - 1);
            }
        
            // Recalculate the subtotal with correct prices
            Vue.set(ticket, 'subtotal', 
                (ticket.adultQuantity * this.ticketPrices.Adult) + 
                (ticket.childQuantity * this.ticketPrices.Child)
            );
        
            // If the ticket quantities reach zero for both, removbe movie row from the cart
            if (ticket.adultQuantity === 0 && ticket.childQuantity === 0) {
                // get the index of the ticket in the cart
                const index = this.cart.indexOf(ticket);
                if (index > -1) {
                    // emit 'remove-from-cart' event to call the remove form cart function based off the index
                    this.$emit('remove-from-cart', index);
                }
            }
        }
        
    }
});  // end of cart component




// Vue App
const app = new Vue({
    el: "#app",
    data: {
        // array to store movie data from api
        apiData: [],
        // array to stroe movies and their ticket quantities in the cart
        cart: [],
        // number of movies to display at once
        numberOfMovies: 3,
        // object to store the prices for adult and child tickets
        ticketPrices: {
            Child: 8,
            Adult: 12
        }
    },
    methods: {
        // method to load 3 more movies...adds 3 more to the numberOfMovies field. 
        loadMoreMovies() {
            this.numberOfMovies += 3;
        },
        // method to add tickets to cart. Takes an object with a movie object, and ticketType fields 
        addToCart({ movie, ticketType }) {
            // test log to see what movie is being added,its type and the price.
            console.log('Adding to cart. movie:', movie, 'ticketType:', ticketType, 'ticketPrices:', this.ticketPrices);

            // check if ticket type is either adult or child
            if (!['Adult', 'Child'].includes(ticketType)) {
                // log error
                console.error('Invalid ticket type', ticketType);
                return;
            }
            
            // set variable for ticket price based off the current ticketPrices object data
            const ticketPrice = this.ticketPrices[ticketType];
            
            // set up error handling for ticket price error
            if (ticketPrice === undefined) {
                console.error(`Invalid ticket price for type: ${ticketType}`);
                return;
            }
            
            // set variable to check if movie is currently in the cart. 
            const existingMovie = this.cart.find(ticket => ticket.movie.id === movie.id);
            // test log error if an existing movie was found
            console.log('Existing movie in cart:', existingMovie);
            
            // check for existing movie being filled(true)
            if (existingMovie) {
                // update the quantities based on what ticket type it is if movie already listed in cart
                if (ticketType === 'Adult') {
                    Vue.set(existingMovie, 'adultQuantity', existingMovie.adultQuantity + 1);
                } else if (ticketType === 'Child') {
                    Vue.set(existingMovie, 'childQuantity', existingMovie.childQuantity + 1);
                }
        
                // recalculate subtotal after updating quantities
                Vue.set(existingMovie, 'subtotal', 
                    (existingMovie.adultQuantity * this.ticketPrices.Adult) + 
                    (existingMovie.childQuantity * this.ticketPrices.Child)
                );
            } 
            else {
                // add new ticket object to the cart to be displayed in its own row
                const newTicket = {
                    // movie object linked to this ticket
                    movie,
                    // if ticket is adult, set quantity to 1, otherwise 0
                    adultQuantity: ticketType === 'Adult' ? 1 : 0,
                    // if ticket is child, set quantity to 1, otherwise 0
                    childQuantity: ticketType === 'Child' ? 1 : 0,
                    // Set price based off ticket type
                    price: ticketPrice, 
                    // set initial subtotal for the ticket currently being added
                    subtotal: ticketPrice 
                };
                // add ticket to the cart array
                this.cart.push(newTicket);
            }
            
            // test log to see if movie or quantities were updated. 
            console.log('Updated Cart:', this.cart);
        }
        ,
        // method triggered by emitted event set to remove object from cart array based off its index that was passed
        removeFromCart(index) {
            this.cart.splice(index, 1);
        }
    },
    computed: {
        // display the first 3 items from apiData array
        displayedMovies() {
            return this.apiData.slice(0, this.numberOfMovies);
        },
        // method to calculate total cart price
        totalCartPrice() {
            // Calculate the total by multiplying price with total ticket quantity in cart rounded to 2 decimal places
            return this.cart.reduce((total, item) => {
                return total + (item.price * (item.adultQuantity + item.childQuantity));
            }, 0).toFixed(2);
        }
    },
    // triggers when vue instance is created
    mounted() {
        // fetches movie data from the api via axios call
        axios.get('https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1', {
            headers: {
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMjBhZWJiNjM0NzVmNzdlZjA2ODNmNWM0MmVlZDkyYSIsIm5iZiI6MTczMTk2NzA0Mi4xOTM0ODQ4LCJzdWIiOiI2NzEyNzEwNDFmMGVhNDcxNGVkYzBjMDgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.2rQPkKiiOnTdL5ZzNhNW3nPZQX74bVuY-2XhEZMUSQk',
                accept: 'application/json'
            }
        })
        // sets returned response to the proper variables and test logs the data
            .then(response => {
                this.apiData = response.data.results;
                console.log('API Response:', this.apiData);
            })
            // catches any errors and displays error log
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }
});  // end of main app


