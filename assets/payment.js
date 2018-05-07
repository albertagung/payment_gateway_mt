$(document).ready(() => {
	console.log('masuk')

	// Styling function
	styling = () => {
		// Card payment on click
		$('#divCardPayment').click(() => {
			// Fill the card background color
			$('#cardPaymentBorder').css('border-color', '#1acedb').css('border-width' ,'3px')
			// Fill card circle
			$('#circleCreditCard').css('background-color', 'yellow').css('border', '2px solid #1acedb')
			// Empty bank transfer circle
			$('#circleBankTransfer').css('background-color', '').css('border', '')
			// Make bank background color white
			$('#bankPaymentBorder').css('border-color', '').css('border-width', '')
			// Hide bank payment details
			$('#divBankDetails').hide()
			// Show card payment details
			$('#divCardDetails').show()
		})

		// Bank payment on click
		$('#divBankPayment').click(() => {
			// Fill the bank background color 
			$('#bankPaymentBorder').css('border-color', '#1acedb').css('border-width', '3px')
			// Fill bank transfer circle
			$('#circleBankTransfer').css('background-color', 'yellow').css('border', '2px solid #1acedb')
			// Empty card circle
			$('#circleCreditCard').css('background-color', '').css('border', '')
			// Make card background color white
			$('#cardPaymentBorder').css('border-color', '').css('border-width', '')
			// Hide card payment details
			$('#divCardDetails').hide()
			// Show bank payment details
			$('#divBankDetails').show()
		})
	}

	// Get value from query
	getQueryValue = () => {
    let arrQuery = [], hash;
    let hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(let i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      arrQuery.push(hash[0]);
      arrQuery[hash[0]] = hash[1];
    }
    // Return object query, but have to called per key. ex: getQueryValue().name
    return arrQuery;
	}

	// Get data products id from server (promise)
	getProductsId = (userId) => {
		return new Promise ((resolve, reject) => {
			// Define url get user by id
			const urlGetUserById = `http://localhost:3000/users/${userId}`
			// Get the data user
			axios({
				method: 'get',
				url: urlGetUserById
			})
			.then((response) => {
				// Define dataUser
				let dataUser = response.data[0]
				// Define arrProducts
				let arrProductsId = []
				// Iterate through user transaction histories
				dataUser.transactionHistories.forEach((dataTransactions) => {
					// iterate through transactions products
					dataTransactions.products.forEach((dataProductsTransaction) => {
						// Push product id
						arrProductsId.push({
							productId: dataProductsTransaction.productId,
							buyingQty: dataProductsTransaction.buyingQty
						})
					})
				})
				resolve(arrProductsId)
			})
		})
	}

	// Get products
	getProducts = () => {
		// Loading overlay start
		$.LoadingOverlay('show')
		return new Promise ((resolve, reject) => {
			// Define url get all products
			const urlGetAllProducts = 'http://localhost:3000/products'
			// Get products
			axios({
				method: 'get',
				url: urlGetAllProducts
			})
			.then((response) => {
				// Define dataProducts
				let dataProducts = response.data.data
				// Define arrProductsTransaction
				let arrProductsTransaction = []
				// Call get products id function
				getProductsId(getQueryValue().userId)
				.then((arrProductFromClient) => {
					// Iterate through arr products from database
					dataProducts.forEach((dataProductFromDatabase) => {
						// Iterate through arr products id
						arrProductFromClient.forEach((dataProductFromClient) => {
							// Check if dataProducts._id same with dataProductFromClient from server
							if (dataProductFromDatabase._id === dataProductFromClient.productId) {
								// Push the transaction object
								arrProductsTransaction.push({
									productId: dataProductFromDatabase._id,
									name: dataProductFromDatabase.productName,
									price: dataProductFromDatabase.productPrice,
									quantity: dataProductFromClient.buyingQty
								})
							}
						})
					})
					// Loading overlay stop
					$.LoadingOverlay('hide')
					// Resolve arr products transaction
					resolve(arrProductsTransaction)
				})
			})
		})
	}

	// Populate query value
	populateQueryValue = () => {
		// Check if data query are available
		if (getQueryValue().email) {
			// Must decode URI component (remove %, =, ? etc)
			$('#cartCustomerEmail').text(decodeURIComponent(getQueryValue().email))
			$('#cartCustomerFirstName').text(decodeURIComponent(getQueryValue().firstName))
			$('#cartCustomerLastName').text(decodeURIComponent(getQueryValue().lastName))
			$('#cartCustomerPhoneNumber').text(decodeURIComponent(getQueryValue().phoneNumber))
			$('#cartOrderTotal').text(decodeURIComponent(getQueryValue().orderTotal))
		} else {
			// Redirect to index.html page
			swal('No order found', 'Please make your order first', 'error')
			.then(() => {
				window.location.replace('index.html')
			})
		}
	}

	// On load
	$('#divBankDetails').hide()
	$('#divCardDetails').hide()
	populateQueryValue()
	getProducts().then((dataProducts) => {
		console.log(dataProducts)
	})
	styling()

})