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
				// Define shipping cost
				let shippingCost = 0
				// Iterate through user transaction histories
				dataUser.transactionHistories.forEach((dataTransactions) => {
					// Define transaction id from client
					let transactionIdFromClient = getQueryValue().transactionId
					// Check if transaction id is the same with the one in DB
					if (transactionIdFromClient === dataTransactions._id) {
						// Assign shipping cost
						shippingCost = parseInt(dataTransactions.shippingCost)
						// iterate through transactions products
						dataTransactions.products.forEach((dataProductsTransaction) => {
							// Push product id
							arrProductsId.push({
								productId: dataProductsTransaction.productId,
								buyingQty: dataProductsTransaction.buyingQty
							})
						})
					}
				})
				// Resolve in object to send differents data
				resolve({
					arrProductsId: arrProductsId,
					shippingCost: shippingCost
				})
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
				.then((objFromClient) => {
					// Define arrProductFromClient
					let arrProductFromClient = objFromClient.arrProductsId
					// Define shipping cost
					let shippingCost = objFromClient.shippingCost
					// Iterate through arr products from database
					dataProducts.forEach((dataProductFromDatabase) => {
						// Iterate through arr products id
						arrProductFromClient.forEach((dataProductFromClient) => {
							// Check if dataProducts._id same with dataProductFromClient from server
							if (dataProductFromDatabase._id === dataProductFromClient.productId) {
								// Push the transaction object
								arrProductsTransaction.push({
									id: dataProductFromDatabase._id,
									name: dataProductFromDatabase.productName,
									price: dataProductFromDatabase.productPrice,
									quantity: dataProductFromClient.buyingQty
								})
							}
						})
					})
					// Loading overlay stop
					$.LoadingOverlay('hide')
					// Resolve in object form sending differents data
					resolve({
						arrProductsTransaction: arrProductsTransaction,
						shippingCost: shippingCost
					})
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

	// Get transaction by id to find the transactionId (order id not object id)
	// (promise)
	getTransactionIdFromDatabase = () => {
		// Loading overlay start
		$.LoadingOverlay('show')
		return new Promise ((resolve, reject) => {
			// Define transaction id from client
			let transactionIdFromClient = getQueryValue().transactionId
			// Define url get transaction id by id
			const urlGetTransactionById = `http://localhost:3000/transactions/${transactionIdFromClient}`
			// Get the data
			axios({
				method: 'get',
				url: urlGetTransactionById
			})
			.then((response) => {
				// Define data transaction
				let dataTransaction = response.data[0]
				// Loading overlay stop
				$.LoadingOverlay('hide')
				// Resolve transaction id (will be used as order id)
				resolve(dataTransaction.transactionId)
			})
		})
	}

	// Get value for bank transfer method (promise)
	getValueForBankTransfer = () => {
		return new Promise ((resolve, reject) => {
			// Call get transaction id function
			getTransactionIdFromDatabase().then((orderId) => {
				// Call get products function
				getProducts().then((objProductsFromClient) => {
					// Define shipping cost object
					let shippingCostObject = {
						id: 'SHIP-FW-123',
						price: objProductsFromClient.shippingCost,
						name: 'shippingCost',
						quantity: 1,
					}
					// Push extra data shipping cost
					objProductsFromClient.arrProductsTransaction.push(shippingCostObject)
					// Create object for bank payment request
					let bankPaymentRequest = {
						payment_type: 'bank_transfer',
						transaction_details: {
							gross_amount: decodeURIComponent(getQueryValue().orderTotal),
							order_id: orderId
						},
						customer_details: {
							email: decodeURIComponent(getQueryValue().email),
							first_name: decodeURIComponent(getQueryValue().firstName),
							last_name: decodeURIComponent(getQueryValue().lastName),
							phone: decodeURIComponent(getQueryValue().phoneNumber)
						},
						item_details: objProductsFromClient.arrProductsTransaction,
						bank_transfer: {
							bank: 'bca', // Sesuaikan sama VA dari Midtrans
							va_number: '123123' // Sesuaikan sama VA Number dari Midtrans
						},
						bca:{
							sub_company_code: '00000'
						}
					}
					// Resolve object
					resolve(bankPaymentRequest)
				})
			})
		})
	}

	// On load
	$('#divBankDetails').hide()
	$('#divCardDetails').hide()
	populateQueryValue()
	getValueForBankTransfer().then((response) => {
		console.log(response)
	})
	styling()

})