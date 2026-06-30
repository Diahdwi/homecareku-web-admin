import { db } from "../config/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  Timestamp,
  onSnapshot,
  collectionGroup
} from "firebase/firestore";
import { initializeApp, getApps, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// Firebase config for secondary auth instance (so we don't sign out the admin)
const firebaseConfig = {
  apiKey: "AIzaSyCCeN_izbTvxor336zrhynDbr9SCYGeyf0",
  authDomain: "homecareku-94c61.firebaseapp.com",
  databaseURL: "https://homecareku-94c61-default-rtdb.firebaseio.com",
  projectId: "homecareku-94c61",
  storageBucket: "homecareku-94c61.appspot.com",
  messagingSenderId: "617644220368",
  appId: "1:617644220368:web:5aeecdbae8e298eeda3d5"
};

// Avatars mapping
export const avatars = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bintang&backgroundColor=b6e3f4", // 0
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Megawanti&backgroundColor=ffdfbf", // 1
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Abyan&backgroundColor=c0aede", // 2
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Nala&backgroundColor=d1f4ff", // 3
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jovan&backgroundColor=ffd5dc", // 4
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zahra&backgroundColor=e8ffdb"  // 5
];

// Helper silhouette placeholder
export const defaultAvatarPlaceholder = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCALgAuADASIAAhEBAxEB/8QAHQABAAICAwEBAAAAAAAAAAAAAAYIBQcDBAkCAf/EAF0QAQAABQEBCAoLCQsKBwAAAAACAwQFBgcSAQgTFCIyUmIVFiMkM0JygqLCISU0NUFDU3ORktIRMURUY2SBscEXJjZFVmFxdJShshhGhJOjpLPR4vA3UVV1g9Py/8QAGQEBAQEBAQEAAAAAAAAAAAAAAAMCBAEF/8QAHxEBAQEBAAIDAQEBAAAAAAAAAAISAwEyEyJCEVIx/9oADAMBAAIRAxEAPwD04AVYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARO/ar6eYx775lQSY/kYJvDzPo3Np6JYNH3jfaYTS7fYS0Xa5fVkQxfX5SHXLfe5BH70YdQSf6xURRxehsvfjp5uVoRTip30uqs/wVTaab5qh+3Ex0e+K1emf50/7pI+y38Hlna7ApL/lFax/yt/3SR9l3abfM6tSP42oJ3z1DK9R58Hk2uaKmUG+3zuR7usFlqfIgmwfqiTC1b72yTPfvEq+m/LU9RDH/AHbuyz8dPdrBjXGPb4HSm/7H75OITo/irhKikf3830mwKOsobjL4zQ1sipkR+PJmwxw/3M4ac4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAw+T5hjeFW3svkl3kUcj0psXRh3PGVu1C30t7uu3bcFpuxVL+PTuVUTPJ3ObC8jnVM7WJy3PMSwem47kl7kUfQlbe1Mi8nc5zR2Yb7fn02E2DyKu4+rLg9aJXSsr6m61sddcqmfU1U6Pbmzp0e1FF+lwOuOEs7SjJ9Ts7zH37ySrnQfJQR7Ev6NxFwbeADbAAAAAAAyVkyHIMcmcZsl2q6CP83qIoWNGXrdeJb6jO7P3LJKaRe5H+onfTByYvqt74Trxp3nGxTU134hcfxS48iLa6u7zYlHRK4mnu3pGKR4BrxneB8DTce7K2v8Rq+Vsw9Xd50KzmnWtmG6jbFNTVPE7p49DUR7MXm7vjIXyqW5tsABlsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABx1NTTUtNHXVs2XJkSYNubHHHswwwg5Gm9V98bZML4ayYtwF1vcHInfI00XW3fG3eq1zrNvja3IOM4tglTMprdzKiu29mZU9WHo7npRNDK8uf+k7tlskye/5jco7tkl2n19VH8rHyYerDueLuMSDrTAAAAAAAAAAAAAAAAH3BOmwTOFl9xjgj24OXsxQxPgBvvSjfOXKzcWsGf8ACV9F/wCoc6dI8r5Xc9JZ+1Xi23yik3eyV1PWUM6DbkzpUe1DE85U3001XyjTK5cJbZnGbdOj74t8cfc5nWh6MfWc189eqkWvYI5g2eY/n9kgveP1PUqJXxkiLo7u4kaCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8jjlQeFmS+Ry444wcdfWUVtoZ1dXVMuTIpoIps2dHHswwww+Mp5rfrlXahVMeP4/NmU2NSfNiq4ulF/N0YXZ171s7eK2PF8bqfaGm8NH+OzIfG+b6P1mm1+XL9UndgDpTAAAAAAAAAAAAAAAAAAAAAAZ/Cc2v+AXuDIMfqeBnwcidB8XPh6MW4uxpvqLYNSbJ2WtPInydmCrpNvlSZnR/o6yhCQYNnN708yCTf7JN5nIqJXiz5fRiQuNNRX8egYwWDZnZM/xumySyTe4zuROg8aRM+GGJnXMsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAK6b5bWDiu3pvjdT3f8AjObBHzYfkPtNo6x6kStNsSnXKX74VPe9DJ/KdL+iHnKOVNTU1dTOrq6Zw0+pjinTY/Giii8ZXnz/AEn5pwgOtMAAAAAAAAAAAAAAAAAAAAAAAAABP9HdVK7TLJOMzOEnWis7lXU/V+Vh68K79BWU1xopNdRTeGk1MqGdKj8WKGL70TzhWO3ruqPBzf3M73U8idtTbZHt82L4ZH7YfOcvXn+lIpZUBFQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfkcfBy4+FmS4NiDbjjj8V+tO75nP+1jCewFDN9sb9tSutDTw+Ei/YROhXnWbUL90bMam5U3vdTd70MH5OHxvO++ggOyPqkAKMAAAAAAAAAAAAAAAAAAAAAAAAAADno6ypoamTXUUzgZ8mbDNkx+NDFD96JwAL6aXZ5Tah4dQZBL5E/wBz1cHydRD9/wD5/pS9TzezZ/2sZt2Arqn2uv2zT9WGo+Li/YuG4ekZpaKAGWgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABRrW/M+3jUS5V1NM4aio4+KUnzcPjedFtRLY6x5bMwrTe8Xemmd9RyuL0nzkz2Nz1olEF+EfpOwB0pgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPuTOmSJkFTTdxjkx7cHViX400zDt8wm1ZJ8fU0+xUdWoh9jd9JQRY7ekZbwdTeMJqZvPg7IUnlfemeqj2j6qQsqA5VAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFb997kk32hxKX1rhUfqh9ZWxsbfA3vs5q1e+hRxw0MH/AMcPs+ltNcuvl4zKNgCrIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAl+kWSdquodhu3xHGIaeo+bmexu/rRB9d1l+on5b8PSEYPBr32z4bZL/8AjlDKnR7fS2fZ9LaZxxqgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4nTpciXHUzeZJg24/JhfbBZ/X9isEyGtlfg1snx/7Ldeigt7r+yt7r7tM/DKibUR+dF91035A/Xb4c4A0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALl72O6zLlpVR03C+4KufSeTDtfd3P1tsK+bz+v27BkNo+Rq5VR9aV9z9iwb5/T2V8AA2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAINrrU8V0lyfr0nA/Wi3NxOWu98H/4Q5D8zK/4+4c/Zm1IAH0EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFh955U7F3yeh6dPInelu7n7VnFWt6D/CnIf/bpX/FWlcPT2W5+oAy0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANf6903D6Q5J1KeGP6s3cbARTVSj7Jab5PQ9O2T9jzYfuvI9hQcB9Hw5wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFg95/B++DJKn8xkQf7VaBXPeeUfeWT13Tm0lP6O7urGOHp7Lc/UAZaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHXuVHx621NDM/CaebT/Wh+47A98DzgqabitTHQ/i0cUqPzfYcaZ6x2Ttf1MyGi8SOriqJXkzPZ3P1oY64SAFGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH1zAW63qlq4ppvOrvx+4TZ31YdyBudENIrJ2uab49aZkrYnwUkM6d5Uz2f2pe+ffsr4ABsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABVTfb43xXKLVlEuVsQXKn4vO+cl/9O76LQ66G+Qxjtj0zrKmV4eyRw10ryYfYi9GL+5S91cq+qNgCzIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzGGWGZk+W2fH5X4fVypMfk7Xs+jtMO3ZvVMY7M5tU5JN8BZKTkfOTPY3PR2krvMtrbQSZUiVwcrmQQbEEHVfoORUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABx1NNLrqadRVMruNTBFKm9aGJ5/ZzitTheW3XF6n8DqIoJPWl/f3IvqvQVXTfY4Nt01BqHQyvc3eld5PxcXq/Qpwv7M2rOA7EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAABdje94ZNw7Teg4zK2Kq8R9kKjpQ7X3ofq7Krej+Ddv+dUFo4PvKTHxiu/q8Pi+dzfOXuggly9jwfI5EEEHiubvf5Uh+gIKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADH5DZKHJ7JWWC5SuGpayVFTzfOZAB56ZhjFywvJK/Frl4ejm7HzkPwRedCw62e+Z0x7Z7B27WSm9sbPB3x0p9L/ANPO8naVMdcXqUbgAVZAAAAAAAAAAAAAAAAAAAAAAAAAAAbQ0B0x7f8ALePXKm9pLPHDNqOjMmeLK9aLqs3eW2+N7lp12nYb2buVNsXe/bNRO6Uun+Lh9bzm2wcF3pUAegAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD5jglx7fCcvb5EcEamuvekv7nt/7LWmm/e9dZve/wCbTPGlfZXMYvJ8YtOW2SpsF/puGoqmDYi6UPRi3P54TneXlzp54CV6kae3fTXJI7Jcu7SPC0lR4s+X0v6elCijtTAG2AAAAAAAAAAAAAAAAAAAAAAAHNTU1TXVMmiopXDT6mOGVKggg2oooovFBkMYxu7ZdkFNYLJTcNW1MexB0YYfhii/mhXswPCbRp5jdNjdp+J5c2Pxp8z4YokQ0N0fladWTj12ly52Q18HfEfO4GH5KH1m0HDd6WiQBloAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABGNQsAsmo2PzrBe5fXp6jY7pTTOlCpHnODX/AL/OsF/l90g5cqd8XPl9KF6Bo3nmAWDUOydhL/AE3Xp5snwkiLpQtcryzUqACX6kaXZJptduJXuVw1FOj70roIO5z4fVj6qIOtgAbYAAAAAAAAAAAAAAAAAAAdu1Wq5Xy5SbRaaGfWVtTHsSpMEG1FEDryZM2fNgl00vho50exByNqKKJbXQjQztLlQZRlMrh79Og73k87iUP/ANn+F29FtB6HAJUF/wAk4OsyGODkeNLpOrD0t3rNwOTr1/MqRIAkoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAx9+x60ZPbZ1pyC2yK+iqefKnQf97O6qfqvvdb/h3DXbF+HvFk58XI2p1ND/AD7njQdZcAez0y8qNPNwXH1L3uWL5rt3fH+Dsl4j5cc2CV3GfF1tz1oVXMz06zHAKni2SWmZJgjj2JVRzpMz+jddUdZpKoyjYCrIAAAAAAAAAAAAAAO3arVcr5XQW20UU+vqp3MlSZO1FEsBppvV5kzgbvqRU8DBz+xkmPlRfOzPVhSu5lrDT+AaY5TqNcuJY/Q9wgj74ro4NmTI8rd6fVXA0x0ixfTKh7xlcZuk6DYq7jNg7pN6sPR3OqllqtVtx+2ybRZKKRR0tNBsSpMmDZhhdxzXelJgAZaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHBX0FFcaaOhuVFIqZE7kRyZsG1DF+hzgNGZzvV8WvO3W4bW9hKqPl8D4Wli9aFobMNGdQ8H2+yWPz51FB+F0nd5foc3zl7BqOtSzh5uC+eT6Rad5j3S94tScPH+ESu4TPpgaoyHehWiP+C+Wz6b8jXSuFh+mDZXjvLOFYxtu972DVW1e4aGgusH5pUcr6I9lC7rpjqJZ/fLCb1J2Of3vFFD9MDW5eIwOedQV1L7pop8ny6eKF1442/wCsP0fm3K+U9JyQU02PwcqOd5m0PXwMxQYZmN197cWu1T81STYvVS+1b3jVq6/5rcQ/r1RDKY201wLDWHei3ePY7ZMtkU3TgoZUU2L6Y+S2djG9y0uxzuk20zLxPg5fDXCdwv8AdzWa6y8wqLj2H5Rl1TxbG7BV1/T4GVyYfK3ebC3bhO9LuU/Yrs7u3FoOfxS3R7UzzpnNh81ZempqahlcWoaaXJkQcyTBBDDD9VypV2pTDBYlg2JYPRcSxuySKPkbEcextTJnlbvOiZ0E2gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHxHBKj8L3by+U606yWSf7ptFBO/0eV9l3B6MfBj2P8A8n7b/ZJX2Xbk0dFI9zUUiT5EmGFygG3M/wDKYA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfEc6VL7pN4Pz49l1Z1+slJ7pvdBJ/wBIhh9Z6O6MHHnOGy/C5baf7XK+04v3SMA/lvZf7XC8wJCI/BqFgn8srL/a5Tsyctxaq9zZTaZ23+dyvtGBlx15NfQz/c1bIneROhidh6ADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcc6plSJUcypmy5MEHPjjj2YYQcg1rlW+E0yxnbldl+ytVB8VboOF/v5rUOT77TKK7uWL2CktsHiTqju8z6Oa1PKqZ2tR8WjF+1LwDGPfvLbbJjg+J4xDFF9EClWQ6l51lXv3lFfOg+R4bgpf0QIwp8DO1u73vrtO6H3pobtdehsSuCh+mNBrxvvcgme8mJUFN/WKiKbF6Gyr6N4lnbaVy3yerVd4O9yKD+r08MKK1+qmol1925tduX+dxQ/wCBFxrEvXbqbxd673Tdqud87URROtHy3yN/xh+bEvqH+rfoD82JfUNiX1H6NDkgqZkHgpkyT5+yydHmGUW33FlN2k/M1c2H1mIGf49Tu265arWr3Nm1fO2Pltmb/jSy1b6vUih98qa01+x+bxSoov0wNMDOJe7WZtW/Aov47w6fJ/qlXDFD9Eab2TfJ6VXj3Te59tjj8Sup4oYfpg2oVLxn4pNvRO1ZJj+QSuFsl7oK/b5nF6iGJkHm/TTptLM4WmmzJMcHM4KPZiTzG9ddUcY9zZRPrJEHxNw74h9PlekjXBra8grnjG+6po+55ji3A/nFuj2of9XH9puLFdVMAzT+D+UUk6f+Lxx8FOh/RGnXOpa2lQA0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAjWZ6i4bgFNxnJLvLkxx+Cp4OVOmeTuAkrBZVnOJYVTcZyS9yKDoQbe1Mi8nc5yteeb6XKb5t0WG03YSl5nC86qi9WFpSvr6241Mddcq2fUz53LjnTY9qKL9KscP9J7WIzPfacJt0OC4/sfndw9WX9ppDJ9QsxzGbwuSZBV1m34m3sy4f0QclHxaImWdgCrIAAAAAAAAAAAAAAAAAAAAeD7pK8TmADYeGa8akYdsSqa98fooPwS4d1h83d50Le+Gb6XCb/sUWUU0dhqo+Rwvhaf63i+cqKJXE01t6N0FfQ3GmgrrbXSKmRO5k6THtQxfpdh594lnmW4PU8exe9z6Pl7ccrb2pczypfNiWFwDfV2S5bFFn9D2Nnx8jj1PBFFJi8rc50PpIXzqVJtv8deguVDeKKCuttdIrKWdy4J0qdtQxfpdhNoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYzIckx/FaGO75Bd5FBSwePHHzvJ6TWWqO+NxvC+GtGN8He7vByI+X3GRF1t3xvJhVXy3Nsozi5dlsju0dZP8ToyurDueK1HLTPm25dRd9Rd7lt23AKbiEjmR3CdBtTovJ3PFaGr6+tuNTHXXKtn1M+dHtxzpse1FE4B0zGWABVgAAAAAAAAAAAAAAAAAAAAAAAAAAAAABI8M1Cy3AK3j2L3eZTbce3Op+dJmeVuLOab75bFsu2LTlPB2G6R8iDbj73nxdXd8XyYlQBK4mmpvL0jg+UlClGmOveW6e7FFU+3Fk/FJsfKlw/kovF8nmrYYNqLi2odt7JY3cuG2PdFPO5M6R5W45ripUi9JOAy0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAh+pGqmN6a23j13m8NXToO9KGTH3Sd9mDrPRIL9kNpxm2zrtkFykUFFJ586ONVPVffFXvMeGsmJcParRzI523s1FTD1ujudVA9QtS8p1KuXHsgru4QR96UkEfc5EPV6/WRReIz7J3YA6EwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB37Jfrtjlyk3awXKfQVtNHtwRwR7P/6gdABbjSXfG2jLeBsGW8Bbb3HyJM3myamL1Y+q3W83G89HN8bXYxxbG87mTK+z/FV3OnU3ldKD0oXN05f5Vi1sB16CvobrQyblba2XU0tTBw0mdBHtQxQ9V2EGwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGnNb9dabA5ceN43Nl1OQzoOX40NJD0ov5+qRGhk9Y9b7RpzTdiKHg6/IZ0HcZPiyOtN+yp9fshu2TXapvd/rZlZW1Me3HH6vkOpWVldcamdXV1TMnT6mPbnTo49qKKJwOuOeUbvQAqyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2PpFrTkGmVdxaZwlfZJ0ffFDt83rSujH/iXIxvJ7Jl1ppr/j9bLrKGpg5HV6sXRjeeCZ6Y6o5Bpld+PWju1FU7PG6Hb5M+H1Y+s5+nLSkWvgMHhmZ2DOLJJyDH63hpE7kR9KXF0Ytzxd1nHOoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1ZrhrHTadWjsbbe7X6sg73/IQ/Kxeq8iNDHa665SsEpo8Xxubw2Q1MHL8aGkh6Xl9VUapqamrqY6mpm8NPnR7c6OdHtRRRP2srK641M6urqmZOn1MfCzZs2PaiiicDsiMo3egBVkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABL9NNSMg02v/Ze292pZ3uuh2+TPh+30Yl28PzCyZxj9NkGP1PDUtT9aXF8MMXXeeqb6UaqXbS/IOPU3fNuqdnj1Jt+Eh6UPXhQuNNRa9gx9hv1pye0U2QWSu4zRVMHDSZv/AH8LIOZYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABjskyS04rZKnIL3U8DRU0G3H9mHrgjmqmpdt01xuO7VPdq2d3KkpNvwsz7EKj9+vd3yO7VN7u1TxmtqZvDTo2Z1Fz+7ajZJU3+5ciX4Kkk+LIl/BCi7o5RlG70AOhkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABtTQrWObpzduxF7m/ver5vfHjcWmfKw+suXJqZVXKgqaabLnSJ0G3BHBzYoek84Fi97TrBwE2TpvklTyI/embOj5sXyH2fqua+X6Ui1mAEFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADmKeb4TVft4v/a3ZKn2ktU3zamo+GL+iHxW298hqj2o4/wBqVkqfbe6ye7dKRT+NF5cXNVEXjn+mLsAdKQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+4J02CbwsvhNuCPbg6UMT4AXV0H1Ul6jY3xa5Tfbu1QQyqv8vD8E3zvG6zZzz8wPM7lgGU0eUW34mPYnSdvkz5fwwxL4Y9frbk9koMgtE3hqKslQzZP2Yv53DcZWimTAZaAAAAAAAAAAAAAAAAAAAAAAAAAAAAGKy3J7biVgr8ku/IkUcnbj6UUXwQw+Uyqqe+i1I7M3uDBbbU95WqPbq/ylR0fNe841TN00/luT3LMckr8ku0zu9ZO2/Jh+CGHyWIB2+EQBoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG+N7BqX2GvfaBd5neV1j26Tl+DqOj53+Jod9yambSTIKmmm8DPkx7cHShi6SVzpt6QCGaS5/K1Cwmjvf4bB3vXSejUQ/f8Arc5M3IqAAAAAAAAAAAAAAAAAAAAAAAAAAAAiGqmcytPcJr7/APhWxxek61RF977Sh9TU1NVUzq2pmcNPqY4p06d0oom4985nnbPmXatRTfa6w8iPoxVEX3/q81ph1RH8lG6AFmQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG197rqF2l5tBaa6b7V37Zp53RlzPi4vV85cx5vQcjqLyaIZ52/4BR11TM9saPvSr+ch8bzoeU5O0fpSaT0BJQAAAAAAAAAAAAAAAAAAAAAAAARjUvMJeCYbdckmeHppWxT7fjVEXsbkKTqv77HM+N3agwSmm8ijg43V/ORfeh+r+t7zjVM20FUzplXUx11TM4afOjinTetFE4Qd6IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA29vZs27WM/7CVU3vLIYOLx9GGo+Li9XzmoX3TVMykmwVNN3GfJjhjg6sUKVzpt6QCN6dZbKzjCbVkkrn1lP3x1ZkPsbsP1kkcioAAAAAAAAAAAAAAAAAAAAAAADr19ZTW2hqa6p5EimkxTpsfVhh+68+8tySpy7JLlklTz6+oineTD8EP1VtN8zlXa/pvU22V4e9zYaSDyfvzPRU0X4R+k7AHSmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsfvSMw7rdcEqZvP9saT9UyH/DEsooNpjk8zDs7smQfEU1XDBUfNxexu+jur8wRy4+6ypnkRuHvP2VkAZbAAAAAAAAAAAAAAAAAAAAAfk6dLkS45tTzJMG3HH1QVI31eSdlc7prBL8BZ6Tl/OTPZ3fR+40ozWZ36bk+W3XIJvL45VzZsHk7XsejssK6+c5lGwBVkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAXr0Wyftt0zslym+Hk0/FKj5yX7H/JRRZfehZJ3tfsSm/Exyq6n872N31Ue8fVWFjAHK2AAAAAAAAAAAAAAAAAAAAIRrTfu1zTK/XKV4eOk4vK8qZ7H7U3aH32974piVnx/wDH6uKoj8mXD9rdOfszaqgD6CIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2TveL92A1WtXyFy2qGb50PseluQtbO3Z7lNs12oLvTc+jqJNRB5sX3U7+zb0YHHTVMuuppNdK5lTJhnQeTFDtuRxqgAAAAAAAAAAAAAAAAAAACpm+0vHHs6tto/ELdDHH5UyL7q2ajevF17MatZDN/FqiGkg82Hcg+0pw/wCsdEAAdiQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC+Wjl4m5Bpdjdd4/FIaePypfsfsTFpveqXLjemUdF+IXCbJ82L7m63I+ffsr4ABsAAAAAAAB/9k=";

// Helper: convert any string to Title Case
export function toTitleCase(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper to convert Firestore status to UI status
const mapStatusToUI = (dbStatus) => {
  return dbStatus === "on_shift" ? "Sedang Bertugas" : "Tidak Bertugas";
};

// Helper to convert UI status to DB status
const mapStatusToDB = (uiStatus) => {
  return uiStatus === "Sedang Bertugas" ? "on_shift" : "tidak_bertugas";
};

// Helper to convert DB lokasi to UI lokasi
const mapLokasiToUI = (dbLokasi) => {
  return dbLokasi === true ? "Rumah Pasien" : "Klinik";
};

// Helper to convert UI lokasi to DB lokasi
const mapLokasiToDB = (uiLokasi) => {
  return uiLokasi === "Rumah Pasien";
};

// Get all nurses
export async function getNurses() {
  try {
    const q = query(
      collection(db, "users"), 
      where("id_role", "==", "/roles/2")
    );
    const querySnapshot = await getDocs(q);
    const nursesList = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const statusUI = mapStatusToUI(data.status);
      const lokasiUI = mapLokasiToUI(data.lokasi);
      const avatarIdx = data.avatar_index !== undefined ? parseInt(data.avatar_index) : -1;
      
      nursesList.push({
        id: doc.id,
        name: toTitleCase(data.nama || ""),
        email: data.email || "",
        phone: data.no_hp || "",
        alamat: data.alamat || "",
        noSertifikat: data.no_sertifikat || "-",
        status: statusUI,
        lokasi: lokasiUI,
        jenisKelamin: data.jenis_kelamin || "",
        tanggalLahir: data.tanggal_lahir instanceof Timestamp 
          ? data.tanggal_lahir.toDate().toISOString().split('T')[0] 
          : data.tanggal_lahir || "",
        isOnline: data.status === "on_shift",
        avatarIndex: avatarIdx,
        photoBase64: data.photoBase64 || null,
        img: data.photoBase64 
          ? `data:image/jpeg;base64,${data.photoBase64}` 
          : defaultAvatarPlaceholder,
        isActive: data.is_active !== false
      });
    });
    return nursesList.filter(n => n.isActive);
  } catch (error) {
    console.error("Error in getNurses:", error);
    throw error;
  }
}

// Subscribe to real-time updates for all active nurses
export function subscribeNurses(onUpdate, onError) {
  const q = query(
    collection(db, "users"), 
    where("id_role", "==", "/roles/2")
  );
  return onSnapshot(q, (querySnapshot) => {
    const nursesList = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const statusUI = mapStatusToUI(data.status);
      const lokasiUI = mapLokasiToUI(data.lokasi);
      const avatarIdx = data.avatar_index !== undefined ? parseInt(data.avatar_index) : -1;

      nursesList.push({
        id: doc.id,
        name: toTitleCase(data.nama || ""),
        email: data.email || "",
        phone: data.no_hp || "",
        alamat: data.alamat || "",
        noSertifikat: data.no_sertifikat || "-",
        status: statusUI,
        lokasi: lokasiUI,
        jenisKelamin: data.jenis_kelamin || "",
        tanggalLahir: data.tanggal_lahir instanceof Timestamp 
          ? data.tanggal_lahir.toDate().toISOString().split('T')[0] 
          : data.tanggal_lahir || "",
        isOnline: data.status === "on_shift",
        avatarIndex: avatarIdx,
        photoBase64: data.photoBase64 || null,
        img: data.photoBase64 
          ? `data:image/jpeg;base64,${data.photoBase64}` 
          : defaultAvatarPlaceholder,
        isActive: data.is_active !== false
      });
    });
    onUpdate(nursesList.filter(n => n.isActive));
  }, (error) => {
    console.error("Error subscribing to nurses:", error);
    if (onError) onError(error);
  });
}

// Get nurse by ID
export async function getNurseById(id) {
  try {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Nurse not found");
    }
    const data = docSnap.data();
    const statusUI = mapStatusToUI(data.status);
    const lokasiUI = mapLokasiToUI(data.lokasi);
    const avatarIdx = data.avatar_index !== undefined ? parseInt(data.avatar_index) : -1;

    return {
      id: docSnap.id,
      name: toTitleCase(data.nama || ""),
      email: data.email || "",
      phone: data.no_hp || "",
      alamat: data.alamat || "",
      noSertifikat: data.no_sertifikat || "",
      status: statusUI,
      lokasi: lokasiUI,
      jenisKelamin: data.jenis_kelamin || "",
      tanggalLahir: data.tanggal_lahir instanceof Timestamp 
        ? data.tanggal_lahir.toDate().toISOString().split('T')[0] 
        : data.tanggal_lahir || "",
      isOnline: data.status === "on_shift",
      password: data.password || "",
      avatarIndex: avatarIdx,
      photoBase64: data.photoBase64 || null,
      img: data.photoBase64 
        ? `data:image/jpeg;base64,${data.photoBase64}` 
        : defaultAvatarPlaceholder,
      isActive: data.is_active !== false
    };
  } catch (error) {
    console.error("Error in getNurseById:", error);
    throw error;
  }
}

// Create new nurse
export async function addNurse(nurseData) {
  try {
    // 1. Create account in Firebase Auth using a separate Firebase App instance
    // to prevent logging out the current admin user session
    const secondaryAppName = `TempApp_${Date.now()}`;
    const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
    const secondaryAuth = getAuth(secondaryApp);
    
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth, 
      nurseData.email, 
      nurseData.password
    );
    const uid = userCredential.user.uid;
    
    // Clean up temporary app instance
    await deleteApp(secondaryApp);

    // 2. Save document to Firestore
    const nurseDocRef = doc(db, "users", uid);
    const docPayload = {
      nama: nurseData.name,
      email: nurseData.email,
      password: nurseData.password,
      no_hp: nurseData.phone,
      alamat: nurseData.alamat,
      no_sertifikat: nurseData.noSertifikat || "",
      jenis_kelamin: nurseData.jenisKelamin,
      id_role: "/roles/2",
      status: mapStatusToDB(nurseData.status || "Tidak Bertugas"),
      lokasi: mapLokasiToDB(nurseData.lokasi),
      is_active: true,
      avatar_index: nurseData.avatarIndex !== undefined ? parseInt(nurseData.avatarIndex) : -1,
      tanggal_lahir: nurseData.tanggalLahir 
        ? Timestamp.fromDate(new Date(nurseData.tanggalLahir)) 
        : Timestamp.fromDate(new Date()),
      created_at: Timestamp.fromDate(new Date())
    };

    if (nurseData.photoBase64) {
      docPayload.photoBase64 = nurseData.photoBase64;
    }

    await setDoc(nurseDocRef, docPayload);
    return uid;
  } catch (error) {
    console.error("Error in addNurse:", error);
    throw error;
  }
}

// Update nurse
export async function updateNurse(id, nurseData) {
  try {
    const docRef = doc(db, "users", id);
    const docPayload = {
      nama: nurseData.name,
      email: nurseData.email,
      no_hp: nurseData.phone,
      alamat: nurseData.alamat,
      no_sertifikat: nurseData.noSertifikat || "",
      jenis_kelamin: nurseData.jenisKelamin,
      status: mapStatusToDB(nurseData.status || "Tidak Bertugas"),
      lokasi: mapLokasiToDB(nurseData.lokasi),
      avatar_index: nurseData.avatarIndex !== undefined ? parseInt(nurseData.avatarIndex) : -1
    };
    
    if (nurseData.tanggalLahir) {
      docPayload.tanggal_lahir = Timestamp.fromDate(new Date(nurseData.tanggalLahir));
    }
    
    if (nurseData.password) {
      docPayload.password = nurseData.password;
    }

    if (nurseData.photoBase64 !== undefined) {
      docPayload.photoBase64 = nurseData.photoBase64;
    }

    await updateDoc(docRef, docPayload);
  } catch (error) {
    console.error("Error in updateNurse:", error);
    throw error;
  }
}

// Deactivate/delete nurse
export async function deactivateNurse(id) {
  try {
    const docRef = doc(db, "users", id);
    await updateDoc(docRef, { is_active: false });
  } catch (error) {
    console.error("Error in deactivateNurse:", error);
    throw error;
  }
}

// Get nurse achievements/orders
export async function getNurseCapaian(nurseId) {
  try {
    const q = query(
      collection(db, "pesanan"),
      where("id_perawat", "==", nurseId)
    );
    const querySnapshot = await getDocs(q);
    const achievements = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      achievements.push({
        id: doc.id,
        layanan: data.nama_layanan || data.layanan || "Layanan",
        layananImg: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.nama_layanan || "layanan"}&backgroundColor=b6e3f4`,
        tipe: data.tipe_layanan || "Rumah",
        pasien: toTitleCase(data.nama_pasien || "Pasien"),
        waktu: data.waktu || "10.00 - 12.00",
        tanggal: data.tanggal_booking instanceof Timestamp 
          ? data.tanggal_booking.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
          : data.tanggal_booking || "12 Mei 2026",
        rekamMedis: data.rekam_medis || data.catatan || "-"
      });
    });
    return achievements;
  } catch (error) {
    console.error("Error in getNurseCapaian:", error);
    return [];
  }
}

// Subscribe to real-time updates for active patients
export function subscribePatients(onUpdate, onError) {
  const q = query(
    collection(db, "users"), 
    where("id_role", "==", "/roles/3")
  );
  
  const pesananQuery = collection(db, "pesanan");

  let latestPatients = [];
  let latestPesanan = [];

  const checkAndEmit = () => {
    const countMap = {};
    latestPesanan.forEach(p => {
      const pid = p.id_pasien;
      if (pid) {
        countMap[pid] = (countMap[pid] || 0) + 1;
      }
    });

    const mapped = latestPatients.map(docData => {
      const avatarIdx = docData.avatar_index !== undefined ? parseInt(docData.avatar_index) : -1;
      return {
        id: docData.id,
        name: toTitleCase(docData.nama || ""),
        email: docData.email || "",
        phone: docData.no_hp || "",
        alamat: docData.alamat || "",
        jenisKelamin: docData.jenis_kelamin || "",
        tanggalLahir: docData.tanggal_lahir instanceof Timestamp 
          ? docData.tanggal_lahir.toDate().toISOString().split('T')[0] 
          : docData.tanggal_lahir || "",
        avatarIndex: avatarIdx,
        photoBase64: docData.photoBase64 || null,
        img: docData.photoBase64 
          ? `data:image/jpeg;base64,${docData.photoBase64}` 
          : defaultAvatarPlaceholder,
        totalTindakan: countMap[docData.id] || 0,
        isActive: docData.is_active !== false
      };
    }).filter(p => p.isActive);

    onUpdate(mapped);
  };

  const unsubscribeUsers = onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    latestPatients = list;
    checkAndEmit();
  }, onError);

  const unsubscribePesanan = onSnapshot(pesananQuery, (snapshot) => {
    const list = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    latestPesanan = list;
    checkAndEmit();
  }, onError);

  return () => {
    unsubscribeUsers();
    unsubscribePesanan();
  };
}

// Get patient by ID
export async function getPatientById(id) {
  try {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Patient not found");
    }
    const data = docSnap.data();
    
    // Fetch their total order count
    const q = query(
      collection(db, "pesanan"),
      where("id_pasien", "==", id)
    );
    const querySnapshot = await getDocs(q);
    const totalTindakan = querySnapshot.size;

    // Fetch patient's addresses from the 'alamat' collection
    const qAlamat = query(
      collection(db, "alamat"),
      where("id_pasien", "==", id)
    );
    const alamatSnapshot = await getDocs(qAlamat);
    const alamatList = [];
    alamatSnapshot.forEach((doc) => {
      const aData = doc.data();
      let addr = `${aData.label}: ${aData.alamat_rumah}`;
      if (aData.jalan) addr += `, ${aData.jalan}`;
      if (aData.catatan) addr += ` (${aData.catatan})`;
      alamatList.push(addr);
    });
    const alamatStr = alamatList.join("\n") || data.alamat || "";

    const avatarIdx = data.avatar_index !== undefined ? parseInt(data.avatar_index) : -1;

    return {
      id: docSnap.id,
      name: toTitleCase(data.nama || ""),
      email: data.email || "",
      phone: data.no_hp || "",
      alamat: alamatStr,
      jenisKelamin: data.jenis_kelamin || "",
      tanggalLahir: data.tanggal_lahir instanceof Timestamp 
        ? data.tanggal_lahir.toDate().toISOString().split('T')[0] 
        : data.tanggal_lahir || "",
      avatarIndex: avatarIdx,
      photoBase64: data.photoBase64 || null,
      img: data.photoBase64 
        ? `data:image/jpeg;base64,${data.photoBase64}` 
        : defaultAvatarPlaceholder,
      totalTindakan: totalTindakan,
      isActive: data.is_active !== false
    };
  } catch (error) {
    console.error("Error in getPatientById:", error);
    throw error;
  }
}

// Delete patient (sets is_active to false)
export async function deletePatient(id) {
  try {
    const docRef = doc(db, "users", id);
    await updateDoc(docRef, { is_active: false });
  } catch (error) {
    console.error("Error in deletePatient:", error);
    throw error;
  }
}
// Subscribe to real-time updates for Layanan
export function subscribeLayanan(onUpdate, onError) {
  const q = collection(db, "layanan");
  return onSnapshot(q, (querySnapshot) => {
    const list = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        nama: data.nama_layanan || data.nama || "",
        harga: data.harga || "",
        durasi: data.durasi || "",
        rating: data.rating || "0",
        gambar: data.gambar || "",
        deskripsi: data.deskripsi_umum || data.deksripsi_umum || data.deskripsi || ""
      });
    });
    onUpdate(list);
  }, (error) => {
    console.error("Error subscribing to layanan:", error);
    if (onError) onError(error);
  });
}

// Add new Layanan
export async function addLayanan(layananData) {
  try {
    const docRef = await addDoc(collection(db, "layanan"), {
      nama_layanan: layananData.nama,
      nama: layananData.nama,
      harga: layananData.harga,
      durasi: layananData.durasi,
      rating: layananData.rating || "0",
      gambar: layananData.gambar || "",
      deskripsi_umum: layananData.deskripsi || "",
      deksripsi_umum: layananData.deskripsi || "",
      deskripsi: layananData.deskripsi || ""
    });
    return docRef.id;
  } catch (error) {
    console.error("Error in addLayanan:", error);
    throw error;
  }
}

// Update Layanan
export async function updateLayanan(id, layananData) {
  try {
    const docRef = doc(db, "layanan", id);
    await updateDoc(docRef, {
      nama_layanan: layananData.nama,
      nama: layananData.nama,
      harga: layananData.harga,
      durasi: layananData.durasi,
      rating: layananData.rating || "0",
      gambar: layananData.gambar || "",
      deskripsi_umum: layananData.deskripsi || "",
      deksripsi_umum: layananData.deskripsi || "",
      deskripsi: layananData.deskripsi || ""
    });
  } catch (error) {
    console.error("Error in updateLayanan:", error);
    throw error;
  }
}

// Delete Layanan
export async function deleteLayanan(id) {
  try {
    const docRef = doc(db, "layanan", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error in deleteLayanan:", error);
    throw error;
  }
}

// Subscribe to real-time updates for all transactions (bookings & pembayaran subcollections)
export function subscribeTransactions(onUpdate, onError) {
  let latestBookings = [];
  let latestPayments = [];
  let userCache = {};

  const emitUpdates = () => {
    const list = [];
    latestBookings.forEach((bDoc) => {
      const bData = bDoc.data;
      const bId = bDoc.id;

      // Find pembayaran matching this booking ID
      const payment = latestPayments.find((p) => p.bookingId === bId);
      
      // Get patient name and avatar details
      const patientId = bData.pasien?.id_pasien || "";
      const patientData = userCache[patientId] || {};
      const patientName = patientData.name || "Pasien";
      const avatarIdx = patientData.avatarIndex !== undefined ? patientData.avatarIndex : -1;
      const patientImg = patientData.photoBase64
        ? `data:image/jpeg;base64,${patientData.photoBase64}`
        : defaultAvatarPlaceholder;

      // Map status
      const paymentStatus = payment?.status || "pending";
      let uiStatus = "Belum Bayar";
      const lowerStatus = paymentStatus.toLowerCase();
      if (lowerStatus === "selesai" || lowerStatus === "lunas") {
        uiStatus = "Lunas";
      } else if (lowerStatus === "batal" || lowerStatus === "tidak selesai") {
        uiStatus = "Batal";
      } else if (lowerStatus === "menunggu validasi" || lowerStatus === "selesai & menunggu validasi") {
        uiStatus = "Menunggu Verifikasi";
      } else if (lowerStatus === "pending") {
        uiStatus = "Belum Bayar";
      } else {
        uiStatus = paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1);
      }

      // Map method
      const rawMethod = payment?.metode_pembayaran || "cash";
      let uiMethod = "Tunai";
      if (rawMethod.toLowerCase() === "qris") {
        uiMethod = "Qris";
      }

      // Timestamp
      const bookingTime = bData.alamat?.created_at || payment?.tanggal_bayar;

      list.push({
        id: bId,
        id_pesanan: bData.id_pesanan || `#${bId.substring(0, 6).toUpperCase()}`,
        id_pasien: patientId,
        nama_pasien: patientName,
        img: patientImg,
        layanan: bData.layanan?.nama_layanan || "Layanan",
        jam_booking: bookingTime instanceof Timestamp
          ? bookingTime.toDate().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })
          : "08:00",
        tanggal_booking: bookingTime,
        tempat_layanan: bData.tempat_layanan || "Rumah",
        alamat_detail: bData.alamat?.nama_jalan || "",
        catatan: bData.alamat?.catatan || "",
        status: uiStatus,
        status_detail: paymentStatus === "selesai" ? "Selesai" : paymentStatus === "menunggu validasi" || paymentStatus === "Selesai & Menunggu Validasi" ? "Selesai & Menunggu Validasi" : "Menunggu Validasi",
        metode_pembayaran: uiMethod,
        harga: payment?.total_bayar || 0,
        bukti_pembayaran: payment?.bukti_pembayaran || null,
        created_at: bookingTime
      });
    });

    // Sort by booking/payment time descending
    list.sort((a, b) => {
      const timeA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at || 0);
      const timeB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at || 0);
      return timeB - timeA;
    });

    onUpdate(list);
  };

  // 1. Listen to users
  const qUsers = query(collection(db, "users"), where("id_role", "==", "/roles/3"));
  const unsubUsers = onSnapshot(qUsers, (snapshot) => {
    snapshot.forEach((uDoc) => {
      const uData = uDoc.data();
      userCache[uDoc.id] = {
        name: toTitleCase(uData.nama || ""),
        photoBase64: uData.photoBase64 || null,
        avatarIndex: uData.avatar_index !== undefined ? parseInt(uData.avatar_index) : -1
      };
    });
    emitUpdates();
  }, onError);

  // 2. Listen to bookings
  const qBookings = collection(db, "bookings");
  const unsubBookings = onSnapshot(qBookings, (snapshot) => {
    const bookingsList = [];
    snapshot.forEach((docSnap) => {
      bookingsList.push({
        id: docSnap.id,
        data: docSnap.data()
      });
    });
    latestBookings = bookingsList;
    emitUpdates();
  }, onError);

  // 3. Listen to pembayaran collection group
  const qPayments = collectionGroup(db, "pembayaran");
  const unsubPayments = onSnapshot(qPayments, (snapshot) => {
    const paymentsList = [];
    snapshot.forEach((docSnap) => {
      const bookingId = docSnap.ref.parent.parent?.id;
      if (bookingId) {
        paymentsList.push({
          id: docSnap.id,
          bookingId,
          ...docSnap.data()
        });
      }
    });
    latestPayments = paymentsList;
    emitUpdates();
  }, onError);

  return () => {
    unsubUsers();
    unsubBookings();
    unsubPayments();
  };
}

// Verify a payment / update status of an order
export async function verifyPayment(bookingId, statusDetail, status) {
  try {
    const pembayaranRef = collection(db, "bookings", bookingId, "pembayaran");
    const snapshot = await getDocs(pembayaranRef);
    if (!snapshot.empty) {
      // Update each document in the pembayaran subcollection
      const promises = snapshot.docs.map((paymentDoc) => {
        return updateDoc(doc(db, "bookings", bookingId, "pembayaran", paymentDoc.id), {
          status: statusDetail === "Selesai" ? "selesai" : statusDetail.toLowerCase()
        });
      });
      await Promise.all(promises);
    }
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    throw error;
  }
}

// Subscribe to real-time compiled notifications for Admin
export function subscribeAdminNotifications(onUpdate, onError) {
  let latestBookings = [];
  let latestPayments = [];
  let userCache = {};

  const emitUpdates = () => {
    const notificationsList = [];

    // 1. Process Bookings (status == "Menunggu Verifikasi")
    latestBookings.forEach((bDoc) => {
      const bData = bDoc.data;
      const bId = bDoc.id;
      const patientId = bData.pasien?.id_pasien || "";
      const patientName = userCache[patientId] || bData.pasien?.nama || "Seseorang";
      const layananName = bData.layanan?.nama_layanan || bData.layanan || "Layanan";

      if (bData.status === "Menunggu Verifikasi") {
        notificationsList.push({
          id: `booking_${bId}`,
          bookingId: bId,
          type: "booking",
          judul: "Booking Baru Masuk",
          pesan: `${patientName} telah melakukan booking layanan ${layananName}.`,
          waktu: bData.created_at ? bData.created_at.toDate() : new Date(),
          is_read: false,
          pasien: patientName,
          layanan: layananName,
          id_pesanan: bData.id_pesanan || `#${bId.substring(0, 6).toUpperCase()}`,
          actionType: "booking_confirm",
        });
      }
    });

    // 2. Process Payments (status == "menunggu validasi" or "Selesai & Menunggu Validasi")
    latestPayments.forEach((pDoc) => {
      const pData = pDoc;
      const bookingId = pData.bookingId;
      const bDoc = latestBookings.find((b) => b.id === bookingId);
      const bData = bDoc?.data;
      const patientId = bData?.pasien?.id_pasien || "";
      const patientName = userCache[patientId] || bData?.pasien?.nama || "Seseorang";
      const layananName = bData?.layanan?.nama_layanan || bData?.layanan || "Layanan";

      if (pData.status === "menunggu validasi" || pData.status === "Selesai & Menunggu Validasi") {
        notificationsList.push({
          id: `payment_${pData.id}`,
          bookingId: bookingId,
          paymentDocId: pData.id,
          type: "pembayaran",
          judul: "Pembayaran Baru Terdeteksi",
          pesan: `${patientName} telah menyelesaikan pembayaran sebesar Rp ${pData.total_bayar || 0} melalui ${pData.metode_pembayaran || "QRIS"}. Status pembayaran menunggu verifikasi admin.`,
          waktu: pData.tanggal_bayar ? pData.tanggal_bayar.toDate() : (bData?.created_at ? bData.created_at.toDate() : new Date()),
          is_read: false,
          pasien: patientName,
          layanan: layananName,
          id_pesanan: bData?.id_pesanan || `#${bookingId.substring(0, 6).toUpperCase()}`,
          nominal: `Rp ${pData.total_bayar || 0}`,
          metode: pData.metode_pembayaran || "QRIS",
          actionType: "payment_verify",
        });
      }
    });

    // Sort by waktu descending
    notificationsList.sort((a, b) => b.waktu - a.waktu);

    onUpdate(notificationsList);
  };

  // 1. Listen to users
  const qUsers = query(collection(db, "users"), where("id_role", "==", "/roles/3"));
  const unsubUsers = onSnapshot(qUsers, (snapshot) => {
    snapshot.forEach((uDoc) => {
      userCache[uDoc.id] = toTitleCase(uDoc.data().nama || "");
    });
    emitUpdates();
  }, onError);

  // 2. Listen to bookings
  const qBookings = collection(db, "bookings");
  const unsubBookings = onSnapshot(qBookings, (snapshot) => {
    const bookingsList = [];
    snapshot.forEach((docSnap) => {
      bookingsList.push({
        id: docSnap.id,
        data: docSnap.data()
      });
    });
    latestBookings = bookingsList;
    emitUpdates();
  }, onError);

  // 3. Listen to pembayaran collection group
  const qPayments = collectionGroup(db, "pembayaran");
  const unsubPayments = onSnapshot(qPayments, (snapshot) => {
    const paymentsList = [];
    snapshot.forEach((docSnap) => {
      const bookingId = docSnap.ref.parent.parent?.id;
      if (bookingId) {
        paymentsList.push({
          id: docSnap.id,
          bookingId,
          ...docSnap.data()
        });
      }
    });
    latestPayments = paymentsList;
    emitUpdates();
  }, onError);

  return () => {
    unsubUsers();
    unsubBookings();
    unsubPayments();
  };
}

// Accept booking and assign nurse
export async function assignNurseAndAcceptBooking(bookingId, orderId, nurseId, nurseName) {
  try {
    // Update bookings
    await updateDoc(doc(db, "bookings", bookingId), {
      status: "Terjadwal",
      perawat: {
        id_perawat: nurseId,
        nama: nurseName
      }
    });

    // Update pesanan
    if (orderId) {
      const q = query(collection(db, "pesanan"), where("id_pesanan", "==", orderId));
      const res = await getDocs(q);
      const promises = res.docs.map((d) => {
        return updateDoc(doc(db, "pesanan", d.id), {
          status: "Terjadwal",
          status_detail: "Menunggu Kedatangan",
          id_perawat: nurseId,
          nama_perawat: nurseName
        });
      });
      await Promise.all(promises);
    }
  } catch (error) {
    console.error("Error in assignNurseAndAcceptBooking:", error);
    throw error;
  }
}

// Reject booking
export async function rejectBooking(bookingId, orderId, reason) {
  try {
    // Update bookings
    await updateDoc(doc(db, "bookings", bookingId), {
      status: "Ditolak",
      alasan: reason
    });

    // Update pesanan
    if (orderId) {
      const q = query(collection(db, "pesanan"), where("id_pesanan", "==", orderId));
      const res = await getDocs(q);
      const promises = res.docs.map((d) => {
        return updateDoc(doc(db, "pesanan", d.id), {
          status: "Ditolak",
          status_detail: "Ditolak",
          alasan_tolak: reason
        });
      });
      await Promise.all(promises);
    }
  } catch (error) {
    console.error("Error in rejectBooking:", error);
    throw error;
  }
}

// Subscribe to real-time updates for Addon
export function subscribeAddons(onUpdate, onError) {
  const q = collection(db, "add_on");
  return onSnapshot(q, (querySnapshot) => {
    const list = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        nama_addon: data.nama_addon || "",
        harga_default: data.harga_default || 0,
        is_active: data.is_active !== false,
      });
    });
    onUpdate(list);
  }, (error) => {
    console.error("Error subscribing to addons:", error);
    if (onError) onError(error);
  });
}

// Add new Addon
export async function addAddon(addonData) {
  try {
    const docRef = await addDoc(collection(db, "add_on"), {
      nama_addon: addonData.nama_addon,
      harga_default: parseInt(addonData.harga_default) || 0,
      is_active: true,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error in addAddon:", error);
    throw error;
  }
}

// Update Addon
export async function updateAddon(id, addonData) {
  try {
    const docRef = doc(db, "add_on", id);
    const payload = {
      nama_addon: addonData.nama_addon,
      harga_default: parseInt(addonData.harga_default) || 0,
    };
    if (addonData.is_active !== undefined) {
      payload.is_active = addonData.is_active;
    }
    await updateDoc(docRef, payload);
  } catch (error) {
    console.error("Error in updateAddon:", error);
    throw error;
  }
}

// Delete Addon
export async function deleteAddon(id) {
  try {
    const docRef = doc(db, "add_on", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error in deleteAddon:", error);
    throw error;
  }
}