const app = new Vue({
    el: "#app",
    data:
    {
        message: 'Fetching data....',
        apiData: null //placeholder
    },

    methods:
    {
        // add methods here
    },
    mounted() {
        axios.get('https://api.example.com/data')
            .then(response => {
                this.apiData = response.data;
                this.message = 'Data fetched successfully!';
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                this.message = 'Failed to fetch data.';
            });
    }
})