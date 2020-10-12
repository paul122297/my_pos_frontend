export function initialize(store, router, axios) {
    router.beforeEach((to, from, next) => {
        const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
        const token = store.state.auth.token;
    
        // if(currentUser){
        //     Echo.connector.pusher.config.auth.headers['Authorization'] = `Bearer ${store.getters.currentUser.token}`
        // }

        if(token){
            axios.defaults.headers.common["Authorization"] = `Bearer ${store.state.auth.token}` 
        }

        if (requiresAuth && !token) {
            next('/');
        } else if (to.path == '/' && token) {
                next('/dashboard');
        }
         else {
            next();
        }
    })



    axios.interceptors.response.use(null, (error) => {
        if (error.response.status == 401) {
            store.commit('destroyToken');
            router.push('/');
            //NProgress.done();
        }

        return Promise.reject(error);
    })
}