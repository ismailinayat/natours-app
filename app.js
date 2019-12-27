/*

IMAGE UPLOADS USING MULTER: USERS

  We want to allow the users to change there account photos. Multer is a very popular 'middleware' to handle 'multi part form data' which is a form encoding that is used to upload the files from the forms.
  In last section we used the 'url encoded form' in order to update user data using the forms and for that we also had to use a special middleware 'app.use(express.urlencoded({ extended: true, limit: '10kb' })).
  Similarly multer is a middleware for multi part form data. Now we will allow users to upload photo using the same 'update-me' route of our api. Previously we allowed our users to update their 'name' and 
  'email' using this route and now we will change the handler function so that its also able to update the user photos as well.

  First we will install the multer package using npm 'npm install multer'. For now we will require the 'multer' package in the 'userRoutes.js' file. Next we need to configure something called 'multer upload'
  and then we will use it. So we will create a const 'upload' and this will be set equal to 'multer()' method. This multer package takes in an object of options and for now the only option that we need to
  specify is the 'dest' for destination and we will set its value to the path in which we want to save the photos which are being uploaded (For our case we want to save in 'public/img/users' directory).

                                        const upload = multer({ dest: 'public/img/users' })

  Now we can also just have call the 'multer()' method without any options and then the uploaded image will have been stored simply in the memory and not saved in the disk. However this is not what we want.
  Now we are saving the images in the file system because the images are not directly uploaded into the database. Instead we just upload them into the file system and then in the database we save the link/
  path to that image. In our case we will input the 'photo' name into the user document and we will do this a bit later.

  Next we will use the 'single()' method on this 'upload' and this 'single()' method will take in the 'photo' that is being sent to us by the user. We can do this in a seperate middleware function which we will
  do a bit later but for now we will create middleware function right in the 'update-me' router before 'userController.updateMe' in the middleware stack.

                                        router.patch('/update-me', upload.single('photo'), userController.updateMe)

  So first we created upload using multer package and we create this upload just to define a couple of settings which in our case was only to define the 'dest' directory. Then on that upload we will use 
  'single' method which is used when only single photo is uploaded and in the 'single()' method we passed 'photo' as input because it is images that will be uploaded. This middleware will then take care of 
  taking that photo and saving into the disk in the destination folder. Also this middleware will put some information about the file on 'req.file' which we can get from within the next middleware in the stack
  which in our case is 'userController.updateMe'. So if we want to look into 'req.file' we will write 'console.log('req.file')' just at the start of 'userController.updateMe' middleware and it will give us 
  information about the file being uploaded.

  Now to test it for now we will test it using postman and later we will also add this functionality to the form. So from postman we need to login and we will login as 'leo@example.com'. After logging in we
  will go to the 'updateMe' route in postman and from there instead of providing the information using body and then json, we will click on the 'form-data' option within the body. And in there we will provide
  the key value pairs. So if we want to change the "name" of leo from 'Leo Gillespie' to 'Leo J. Gillespie' we will write there in key and value columns. Then for photo we will specify the name of the photo
  field in the 'key' column and in our case it is 'photo' and from there we will also change data type from text, which is the default, to 'file' which we want in this case. Then on value cell we will click
  on 'select file' button and select the file that we want to upload. And now when we send the request we can see that in the returned user document the 'photo' field of the user did not actually changed
  because until now we didn't do that and we will do it bit later. For now we will only have uploaded the file in the destination folder. Also if we look in the 'req.file' in our console we can see all kind
  of information about that file including, original name, destination, new file name and size etc. Now if we also had console.log(req.body) in the updateMe middleware, then we will see that body only contains
  the 'name' field. This is because the 'body-parser' is not able to handle the files and thats the actual reason why we need to use the 'multer' package. Now that file should be saved in the destination 
  folder however if we look at it there it doesn't even have the extension and so we can't open it just like that. However our file is showing up that means that the 'upload' that we made is actually working.

  CONFIGURING MULTER:

  Now we will configure 'multer' to our needs so that it gives the better filenames and also allowing only image files to be uploaded in our server. First we will remove everything related to multer from
  the 'userRoutes' to 'userController' because now we will make a middleware function there and use it in the 'userRoutes' just like we did for all of the other middleware functions. So in the 'userController' 
  we will first require multer and then create and export the middleware as follow:

                                  const upload = multer({ dest: 'public/img/users' })

                                  exports.uploadUserPhoto = upload.single('photo')

  And now in the 'userRoutes' we will use this 'userController.uploadUserPhoto' before 'userController.updateMe'. And we are back to the same position as above.
  
  However with the current implementation we are facing some problems. 1 problem is that of file name and extension. Filename for each of the uploaded image must be unique and also with a valid extension.
  Another issue is that of filtering the uploaded files so that only images are uploaded. In order to solve both of these problems instead of creating a simple upload like above we will configure 'multer'.
  Now to configure 'multer' we will need to create something called 'multer storage' and 'multer filter' and then we will use both of these to create the 'upload' from there.

  Now for multer storage we will create a const 'multerStorage' and that will be equal to 'multer' method & on the multer method we will use 'diskStorage()' method. Now we can also store the image in the memory
  which we will do later but for now we only want to store the images in the disk. The 'diskStorage()' method will then take in an object for couple of options. The first option is the 'destination' but here
  we can not simply put the 'path' like 'public/img/users'. This 'destination' will be a callback function which takes in the 'req', 'file' which is currently being uploaded and also to a 'callback function'.
  This callback function is a bit like the 'next()' function in express in a sense that we can pass the errors init like we do when calling the 'next()' but here we will call it 'cb' because it is not coming
  from express. Then in the 'destination's callback function's body we will call this 'cb()' and the first arguement is the 'error' if there is one and if there is not then first argument is 'null'. The second
  argument is then the actual destination which in our case is 'public/img/users'. Thats it for the 'destination' option. The next option that we need to use in the 'diskStorage({})' object is the 'filename' 
  and similar to 'destination' this is also a callback function and takes in 'req, file and cb as input. And in there we want to create unique file names for photos and the way we want to create file names is to
  call them 'user-userId-currenttimestamp.fileextension' so something like 'user-asd4v567e6s-33214633466.jpeg'. We are using this format because we want it to make sure that there are no two files with the
  same file names. Now the extension is in the 'mimetype' property of 'file' which are available on these callback functions and we will get it there. We will get the userId from the 'req.user.id' because 
  this route is protected and so the 'protect' middleware will attach the current user document to the 'req'. And for timestamp we will use the 'Date.now()' method.

                                    const multerStorage = multer.diskStorage({
                                      destination: (req, file, cb) => {
                                        cb(null, 'public/img/users');
                                      }
                                      filename: (req, file, cb) => {
                                        const ext = file.mimetype.split('/')[1];
                                        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
                                      }
                                    })

  Thats it for our 'multerStorage'. Next we will create the 'multerFilter' and this will be a function which also takes in (req, file, cb) as input. The goal of this is to make sure to only save the file
  if the file is an image and if it is an image we will pass 'true' into the callback function 'cb' and if its not we pass the 'false' into the callback function 'cb' along with an error. Now if we want to
  allow the users to upload only 'csv' file for some other project then we will test for that. In the body of the functon we will use an if condtional to check that if the file is an image. To check that again 
  we will use the 'mimetype' property of 'file' object. Now for all types of the images, the mimetype property will have 'image' before the forward slash and we can therefore use it.
  
                                    const multerFilter = (req, file, cb) => {
                                      if (file.mimetype.startsWith('image')) {
                                        cb (null, true)
                                      } else {
                                        cb(new AppError('Not an image! Please upload only images.', 400), false);
                                      }
                                    };

  Now that we have created the 'multerStorage' and 'multerFilter' we will pass these in the 'multer()' method as an object, to create 'upload'. The fields that this 'multer()' expects in the object that we
  pass into it are 'storage' and 'fileFilter' and we will set these equal to 'multerStorage' and 'multerFilter' for both of these respectively.

                                    const upload = multer({
                                      storage: multerStorage,
                                      fileFilter: multerFilter
                                    });

  And now if we test it again from the postman then we can see the image in correct format and filename and destination. And if we instead of an image try to upload another format file we will get an error.
  
  SAVING IMAGE NAMES OF THE NEWLY UPLOADED IMAGES INTO THE USER DOCUMENTS:

  We have stored the uploaded image with the correct format and in the correct destination, now we also need to update the user document for which this photo relates to and change the photo property of it. 
  In the 'updateMe' function we are creating a 'filteredFields' object which comes from filtering the 'req.body' using the 'filterObj' function that we defined and this function takes in an object as input and
  and spread operator '...allowedFields' as second input which simply means that we can input arbitrary number of arguments to this function after the 'req.body' and all of these will be saved in an array called
  'allowedFields. Then it creates and returns a new object and in that object only those key value pairs are present for which the key is equal to any of the allowed values. And then we pass that 'filteredFields' 
  into the 'User.findByIdAndUpdate' method as a second input. Now we also want to add the 'photo' property in the 'filteredFields' object and it is actually pretty simple. So we will simply test for if there is 
  'req.file' and if it is then set the 'filterdFields.photo = req.file.filename'. 

                                    const filteredFields = filterObj(req.body, 'name', 'email');

                                    if (req.file) filteredFields.photo = req.file.filename
                                    const updatedUser = await User.findByIdAndUpdate(
                                      req.user.id,
                                      filteredFields,
                                      {
                                        new: true,
                                        runValidators: true
                                      }
                                    );
  
  And now when we test the uploading the photo using the 'update-me' route then in the returned user document we should get the updated photo property for that user and also the user document will be updated in
  the database as well.

  However here a question arises that what happens when a new user is created. For that situation we will use a 'default image' file. And for every user that photo will be set as default and to do that, in the
  'userModel' for the 'photo' property we will set the type to be the 'String' and now we will also set 'default' option to 'default.jpg'. Now if we create a new user through postman providing the 'name'
  'email', 'password' and 'passwordConfirm' properties then that user will be created and its photo will automatically be set to that default.jpg photo and we can confirm it by logging in as that newly
  created user and going to the 'Account' page.
  
  RESIZING IMAGE:

  What if the user uploads a very large image or the image which is not even a square shaped image. In that case we need to resize the image and also format the image as needed for our application. So we will
  see now how we can do image processing and manipulation with nodejs and in this particular case we want to resize and convert our images. Now while uploading we assume that the image coming in is a square
  image so that we can display them as circles which only happens when the image is square. However in real world that is a rare case that user uploads an square image and so our job is now to resize the images
  to make them squares. In order to do that we will create another middleware called 'resizeUserPhoto' just below the 'uploadUserPhoto' middleware that we created above in the 'userController' file. Like
  normal middleware functions this will take req, res and next as input. Now we will use the 'uploadUserPhoto' middleware before this 'resizeUserPhoto' middleware and therefore we will have access to the
  'req.file' if there was an upload and if there was no upload then we dont want to do anything and call the next middleware in the stack. However if there is an image being uploaded then we need to resize 
  it and for that we will use an npm package called 'sharp'. So we will install it using 'npm i sharp' command in the terminal and require it as 'sharp' in the 'userController' as well. Now this 'sharp' is
  an easy to use image processing library for nodejs and we can do a lot of stuff with it but where it really shines is for resizing images in a very simple way. In order to do that we use the 'sharp()'
  method and in the parenthesis we need to pass in the file. Now when doing image processing right after uploading the file then its always best to not save the file to the disk but instead save it to memory.
  So in order to do that we won't need any of the code that we defined for 'multerStorage' and instead we will create it like following:
  
                                                      const multerStorage = multer.memoryStorage()

  This way the image will be stored as a buffer and we can access it using 'req.file.buffer'. And so we will pass this 'req.file.buffer' as input to the 'sharp()' method. Now calling the 'sharp()' function
  like this will then create an object on which we can then chain multiple methods and the first method that we will use is the 'resize()' method which takes in the pixel values for height and width and
  we will put 500 for both. Now by default fitting method is the 'cover' which will crop the image to make the size smaller however we can change that default method and choose from 'contain', 'fill', 'inside'
  or 'outside'. We can do that by creating an options object after the width and height and in this options object we can pass the options for fine tuning our images. One of the option is 'fit' and for that
  we can pass any one of the above fitting methods. Along with 'fit' method we can also specify the 'position', 'background' etc options as well but for now we don't want any of that. So default fitting
  method is fine for us.

  Next we will use another method 'toFormat()' and in the parenthesis we will pass 'jpeg' which is the image format we want. And then we can also use the 'jpeg()' method to compress the image so that it
  doesn't take much of the space. So in this 'jpeg()' method's parenthesis we will pass an object for options and in there we will specify the 'quality' field and set it to 90%'. And finally because we want
  to store this file in our disk so for that we will use 'toFile()' method. Now this 'toFile()' method will take in the address and file name as input. We can do it like that and simply put the address and
  file name directly into this method 'public/img/users/`user-${req.user.id}-${Date.now()}.${ext}` however we won't pass the filename directly into this method. The reason is that while creating the 
  'multerStorage' we simply saved the image in the memoryStorage and although it will still create the 'file' object but that object won't have the 'filename' property in it. This will cause problem in the 
  'updateMe' middleware function because in there we are using 'req.file.filename'. So instead in this middleware i-e in the 'resizeUserPhoto' middleware, we will attach the 'filename' property to 'req.file'.
  For that we will simply write 'req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`. Then in the 'toFile()' method we will pass the 'req.file.filename' as input. However we don't need the 'ext'
  part at the end of the 'filename' because now we already have used the 'toFormat' method and give 'jpeg' as input and so instead we will write '.jpeg'. Finally because this is a normal middleware function
  we will call 'next()' at the end. 

  However this 'sharp()' method will actually return a promise because it runs 'asynchronously' which also makes sense because the process of resizing an image will ofcourse take time and therefore doing
  that using synchronous javascript and blocking the event loop is not a good idea. Also we are imediately calling the 'next()' method which will take the code to the next middleware in the stack without the
  previously being completed. So we will make the whole function an 'async' function and await the whole 'sharp()' function.

                                                    exports.resizeUserPhoto = catchAsync( async (req, res, next) => {
                                                      if (!req.file) return next()

                                                      req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

                                                      await sharp(req.file.buffer)
                                                        .resize(500, 500)
                                                        .toFormat('jpeg)
                                                        .jpeg({quality: 90%})
                                                        .toFile(`public/img/users/${req.file.filename}`);

                                                      next();
                                                    });

  And we will use this middleware function after the 'uploadUserPhoto' middleware but before 'updateMe' middleware.

                                                    router.patch('/update-me', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe)

  And now we can test by updating the photo of the 'Arav Lynn' for which new non-square photo is in the 'img' directory by the name of 'aarav' and as a result its image will be transformed and that transformed
  image will be then saved in the destination folder that we specified in the 'toFile' method on the 'sharp()' function.

  ALLOWING USERS TO UPLOAD IMAGES FROM THE FORM:
  
  What we want is that whenever a user clicks on the 'Choose new photo' from their 'account' page a new window opens from which we can then select a new image. And after that when the user clicks on the 'Save
  Settings' button we want to upload that image into our backend and also update the user. Now first thing first and that is to add an 'input' tag in our pug template so that when the user clicks on the button
  a new file selector window opens. At the moment that button is created using the 'anchor' link 'a' which is not what we want. So we will get rid of it and create an 'input' of the type 'file'. Next we can
  also specify 'accept' attribute to limit which files can be uploaded in this input and we will set it to 'image/*' and in this way we are telling the input to accept all of the files with 'mimetype' starting
  with 'image/'. And we will also give it a class name 'form__upload' which is already styled in our css form and also an 'id' of 'photo' so that we can select it in our javascript. And finally we also need 
  to give this input a 'name' as well and we will set the name to be 'photo'. It is important to give it this name because thats the name that we have given in our 'user' documents for user images and its 
  also the field name that 'multer' is expecting. Next we also need to create the 'label' for this 'input' element and in that label we will set 'for' to the id in our input which is 'photo' and for 
  its text we will use 'Choose new photo'. So what happens is that when we click on this label, it will then activate the input element which have the 'id' that we specified in the 'for' attribute of 'label'. 
  Thats all we need to do here.

                                                    input.form__upload(type='file', accept='image/*', id='photo', name='photo')
                                                    label(for='photo') Choose new photo

  Now once again there are two possible ways of sending this data to the server. 1st without the api as we learned before where we need to define the 'action' and 'method' attribute of our 'input' tag. And 
  with that method the data is directly sent to server looking for the route which we used in the 'action' and 'method' attributes. If we used that method then for images we also would have to define another 
  attribute 'enctype' and set it to 'multipart/form-data' and without it the  form will simply ignore the data and send the data without the image. However we are using our 'api' for this functionality. Now 
  in the 'index.js' file we already have implemented the functionality for updating of 'email' and 'name' using our website forms and for that we first check if the 'template' has the specific 'class' or 'id' 
  or not. If it has we add an event listener to that element and in case someone submits that data we get the values from the input forms and send that data to another handler function 'updateSettings'. This 
  'updateSettings' function uses the 'axios' to send the 'patch' request to our api urls.

                                                                    if (userDataForm) {
                                                                      userDataForm.addEventListener('submit', (e) => {
                                                                        e.preventDefault();
                                                                        const email = document.getElementById('email').value;
                                                                        const name = document.getElementById('name').value;
                                                                        const type = 'data'
                                                                        
                                                                        updateSettings({name, email}, type);
                                                                      })
                                                                    }

  However now because we also want to allow to update the photo of the users here as well, we need to programaticaly recreate a multi part form data. And the way we do it is that we first create a 'new formData()'
  and save it in a constant which lets call it 'form'. And now on this 'form' we can append all the data and for that we will use the 'append()' method on the form. The first input to the 'append()' method is
  the 'name', corresponding to the 'name' attribute of the 'input' tag, and then its value which we will again get using the 'DOM'. So we will append both the 'name' and 'email' into this 'form' and then send 
  this form to the 'updateSettings' function. And axios will recognize this form as the form and will just do the same thing as it did before. But before we will also add the 'photo' which is actually the entire 
  reason for creating this 'form' object using 'formData()' method. So for photo we will again use the 'append()' method on the 'form' as well and first name will be 'photo' because that is the name that we 
  gave in our form in the template for image. Then to select that image again we will use 'DOM' but instead of 'value' we will use the 'files' method. Now this 'files' method actually returns an array for all
  of the files being uploaded. And because we are only uploading one file we will select the first element from that array. 

                                                                    if (userDataForm) {
                                                                      userDataForm.addEventListener('submit', (e) => {
                                                                        e.preventDefault();
                                                                        const form = new formData();
                                                                        form.append('email', document.getElementById('email').value)
                                                                        form.append('name', document.getElementById('name').value)
                                                                        form.append('photo', document.getElementById('photo').files[0])

                                                                        const type = 'data'

                                                                        updateSettings(form, type);
                                                                      })
                                                                    }
  
  We don't need to change anything in the 'updateSettings' and also our router handler for 'update-me' route also accepts the 'images' as input. So now we can use the website to upload the images. However
  after updating it will not automatically apply and instead we have to reload the page. Now we can use javascript so that the new images automatically reflects in the website but that takes a lot of work.

  UPLOADING AND STORING MULTIPLE IMAGES: TOUR:

  Next we will look at how to upload multiple images in the same time and also process the multiple images at the same time. And this time we want this functionality for the tour documents. Now for each
  document we will need to have a 'cover photo' and then atleast 3 more images to show them in the tour detail page as well. For these we will use almost the same process as we did for 'single' photos and
  therefore we can actually use the 'multerStorage' and 'multerFilter' configuration that we created before and paste these into the top of the 'tourController'. We will also need to require 'multer' and
  'sharp' packages in the 'tourController' as well.

                                                                    
                                                        const multerStorage = multer.memoryStorage()

                                                        const multerFilter = (req, file, cb) => {
                                                          if (file.mimetype.startsWith('image')) {
                                                            cb (null, true)
                                                          } else {
                                                            cb(new AppError('Not an image! Please upload only images.', 400), false);
                                                          }
                                                        };

                                                        const upload = multer({
                                                          storage: multerStorage,
                                                          fileFilter: multerFilter
                                                        });

  All of this will remain the same and now we will create the 'middleware' called 'uploadTourImages' using the 'upload' above. Now for 'uploadUserPhoto' we used the 'single' method on the 'upload' but now
  we have multiple files and in one of them we have 'one' image for 'cover photo' and in other file we have 3 images. For this we have to use the 'fields()' method which takes in an array. In that array each 
  element will be an object where we specify the 'field name' of the 'tour' document that this relates to and next we will also set the 'maxCount'. Now we will set the name property to 'imageCover' and then
  'maxCount' property to '1'. That will mean that we can only have one field called 'imageCover' which will be processed.

                                                        exports.uploadTourImages = upload.fields([
                                                          {name: 'imageCover', maxCount: 1}
                                                        ])

  And then for 'images' field in our tour document we will set the 'maxCount' to 3.

                                                         {name: 'images', maxCount: 3}

  Now if we didn't have our document model like this and instead we would have all of the files in one of the files then we will have used the 'upload.array()' method and in the parenthesis we will need to 
  give the field name and maxCount.

                                                        upload.array('images', 5)

  When there is single image we will use 'upload.single('image')

  And finally when there are mix of them we will have to use 'upload.fields()' like above.

  So now we will have an object in the 'req.files' which will contain two key value pairs. 1st the 'imageCover' and its value will be an array containing an object in itself about the information of the file
  uploaded. Similarly we will also have 'images' in the 'req.file' and this will also be an array containing 3 objects in itself corresponding to 3 images of the tour. For each of the image we would have the
  'buffer' property which is the representation of the actuall image. However at this point we have not implemented the logic to actually save the images in the file system and then also update the tour 
  documents fields for which the images are being uploaded. This is because before saving the images we need to process these images.

  For processing the tour images we will create another middleware function called 'resizeTourImages' and we will make it an async function because again we will use 'sharp()' method and we are dealing with
  image processing. Therefore we will also wrap the whole function with 'catchAsync'. Again just like before first we will check if there is no 'req.files.imageCover' and also no 'req.files.images' then simply
  call 'next()'. However if there are these properties in 'req.file' object, meaning that images are being uploaded, then we will process these file images.

  Now we will divide the image processing into two steps and in first step we will process the cover image. So we will again use the 'sharp()' function and this time we will give it 'req.files.coverImage[0].buffer'.
  For 'resize' method we want to use 2 to 3 ratio and width will be '2000' and height will be '1333'. The 'toFormat' and 'jpeg' will remain same but we will change the address in 'toFile' method because this
  time instead of users directory we will save the images in the 'tours' directory. However we will need a unique file name for our tour images as well so that no images are overwritten. Now again we will
  use the tour-id-timestamp-extension format for the tour file names as well. Now we can get the id of an tour from the 'params' because this route will always contain the id of the tour as a parameter. After
  we are done with the processing of 'imageCover' we will now attach it with 'req.body' because the tour update handler function actually takes this 'req.body' as input and updates all of the fields in the 
  req.body object. 


                                                        exports.resizeTourImages = catchAsync(async(req, res, next) {
                                                          if (!req.files.coverImage || !req.files.images) return next()

                                                          const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`

                                                          await sharp(req.files.coverImage[0].buffer)
                                                            .resize(2000, 1333)
                                                            .toFormat('jpeg')
                                                            .jpeg({ quality: 90 })
                                                            .toFile(`public/img/tours/${imageCoverFilename})

                                                          req.body.imageCover = imageCoverFilename
                                                        })

  Now that we are done with the 'imageCover' next we will process the remaining images that are in the 'req.files.images'. Now again the images in 'req.files.images' are in an array and so we will loop through
  them. So we will use the 'forEach()' method on 'req.files.images' and this method will have access to the each element in the array and also the index and we need to use the index to name the image filenames.
  For filenames we will use the index + 1(because index is 0 based) at the end of the file instead of cover. Then similar to above we will use sharp() method in the loop to process each of the image as well
  and for 'toFile' we will use the filename created for each image. And then again just as we needed to attach the imageCover file name to req.body we will also need to attach the images to req.body as well.
  However the 'images' field is actually an array and so we will push the filename into req.body.images array. So before the loop we will create an empty array 'req.body.images = []' and then in each iteration
  we will push current filename to this array. However there is one problem with our 'async await' and i-e is we are actually not using them right. The reason is that this 'async await' is only inside the
  callback function of 'forEach' loop and that will actually not stop the code from moving to the next line (which is the 'next()' method) until the code is finished, which is the 'await' is supposed to do. 
  Now since this callback function is an 'async' function it returns a promise. So if we instead of 'forEach' change it to 'map' we will have then an array of all of these promises and on this array we can 
  use 'Promise.all' to await all of the promises in that array. And like that we will first complete all of the image processing and only then call the 'next()' method.


                                                        await Promise.all(
                                                          req.files.images.map(async(file, i) => {
                                                          const imageFilename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`

                                                          await sharp(file.buffer)
                                                            .resize(2000, 1333)
                                                            .toFormat('jpeg')
                                                            .jpeg({ quality: 90 })
                                                            .toFile(`public/img/tours/${imageCoverFilename})

                                                          req.body.images.push(imageFilename)
                                                          })
                                                        )
                                                        next()
                                                      })

  Now that we are done with getting images using multer and then processing them using sharp we need to add both of these middleware in the middleware stack for updateTour route.

                                                      router.route('/:id')
                                                        .patch(
                                                          authController.protect,
                                                          authController.restrictTo('admin', 'lead-guide'),
                                                          tourController.uploadTourImages,
                                                          tourController.resizeTourImages,
                                                          tourController.updateTour
                                                        )

  And now we can change the images from the postman again using the 'form-data'. Now to test it, in postman we will again use the 'form-data' tab from the 'body' and in there we will provide the fields that
  we want to update in the tour document. Now for each of the image in images we will create one key value pair where key will be 'images' in all 3 cases and the value will be the name of the image file.

  BUILDING A COMPLEX EMAIL HANDLER:

  We previously build an email sender for the password reset functionality but now we will take that to a whole new level. We will build email template with pug and send real email using the 'sendgrid' service.
  In the 'email.js' file within the utils directory we have implemented an email handler but it is very simple and doesn't take much options. But now we will create a much robust email handler. For this we
  will create a class named 'Email' in the 'email.js' file and also export it as well. Now as always a class need to have 'constructor()' function which is basically a function that will run when a new object
  is created through this class. Now we want to use this class for creating new instances of 'Email' and each instance will take in two inputs. 1st input will be the 'user' which will contain the 'user's email' 
  and 'username'. The other input that will go into this class instance will be 'url'. And then on this instance we will call different methods like 'sendWelcome()' when a new user signs up to our application 
  and similarly 'sendPasswordReset()' for reseting the users password. And in this way it will become a lot easier to create these methods and send emails according to the scenarios. 

  So we will also need to give these inputs to the class constructor while creating the class. And we will create 'to', 'firstName', 'url' and 'from' properties into this class like following;

                                      module.exports = class Email {
                                        constructor(user, url) {
                                          this.to = user.email,
                                          this.firstName = user.name.split(',')[0],
                                          this.url = url,
                                          this.from = `Jonas Schmedtmann <${process.env.EMAIL_FROM}>`   //We defined this from email into 'config.env' so that later it can be changed easily.
                                        }
                                      }

  Next for 'transporter', i-e the service we use to transport the emails, we will actually create a class method called 'newTransport()'. However the function of this method will depend on the environment.
  So if we are in  'development' we don't want to send actuall emails and so we will keep using 'mailtrap' for this as well. But during 'production' we would want to send the actuall emails using a service
  called 'sendgrid'. So we will use the if conditional and use the 'process.env.NODE_ENV' to check the environment and depending on the environment we will create different 'transporter'.

                                      newTransport() {
                                        if (process.env.NODE_ENV === 'production') {
                                          // Sendgrid
                                          return 1;
                                        }

                                          const transporter = nodemailer.createTransport({
                                              host: process.env.HOST_EMAIL,
                                              port: process.env.PORT_EMAIL,
                                              auth: {
                                                user: process.env.USER_NAME_EMAIL,
                                                pass: process.env.PASSWORD_EMAIL
                                              }
                                            });
                                          }

  So we already have saved the 'host', 'port', 'user' and 'pass' information relating to the 'mailtrap' in the 'config.env' so we will use the same here again. And also we will delete the transporter that
  we created earlier. After creating the method for 'newTransport' we will create the 'send()' method to actually send the emails. This 'send()' will receive the 'template' and 'subject' as input. The reason 
  that we need to pass the 'template' and 'subject' as input to this 'send()' method is because later we will need to call this 'send()' method in different kind of other methods which are more specific
  to the situations. For example we will later create the 'sendWelcome()' method and in that method we will call this 'send()' method and giving 'template' and 'subject' as input specifically created for 
  sending the welcome messages to new users.

  However before creating those more specific functions lets get back to our 'send()' method. We will go through following 3 steps:

    1) RENDER HTML BASED ON A PUG TEMPLATE:
    
                                          Usually to render a template we use 'res.render()' method and in this method we pass the template name. Now behind the scenes this 'render' method actually creates
      HTML template based on the 'pug' template that we gave it as input and then sends it to the client. However this time we actually don't want to send the 'html' template but we just want to create it so
      that we can then send that HTML as the email. For this we will need to require the 'pug' package in this 'email.js' file. Then we will use the 'pug.renderFile()' method of pug and in the parenthesis we
      will pass the path of the pug template that we want to send as email. We will save the result in a constant called 'html'. Again we will create the template named 'welcome.pug' in the 'views' directory
      and then pass into this 'pug.renderFile' method. Also because we want to send the personalized emails we will need to send another object into this method in which we will pass 'firstName' which will 
      be set to 'this.firstName', 'url' set to 'this.url' and finally we will also need to send the 'subject' as well. So now we will have the 'html' formated file with us in the 'html' constant.

    2) DEFINE THE EMAIL OPTIONS:

                              Similarly to earlier we will again define an object for 'mailOptions' and in here we will use the 'from', 'to', 'subject', 'html' and 'text' options. Both 'from' and 'to' will be 
      comming from the class properties and need to be provided while instantiating the class. And 'subject' will be passed to the 'send()' method and 'html' will be the same that we created in step 1. Now
      we also need to creat the 'text' version of the email and it is important because many people prefer the plain text email instead of formated one and therefore in order to increase the readablity of our
      emails we should always create the 'text' format of our email along with html. Now to do that we will install another package called 'html-to-text' and then require it as 'htmlToText'. Then on this we
      will call the 'fromString()' method and pass the 'html' into it.

    3) CREATE TRANSPORTER BY CALLING THE 'newTransport' METHOD AND SEND THE EMAILS:

                              Finally to send the emails we will create the transporter using the class method 'newTransport' method that we defined. So we will call this 'newTransport' method on the 'this'
      keyword because it is actually a class method and then on this we will chain 'sendMail()' and init we will pass the 'mailOptions' object that we created above. Now we will await it this because it is
      an 'asynchronous' code and then also make this 'send()' method an 'async' function.

  Finally we can add as much methods on this class as we need for specific scenarios because we will use the 'send()' method that we created above to send the emails. So we will create the 'sendWelcome' method 
  to send the 'welcome' message to new users and in it we will use the 'send()' method passing in the welcome template and subject and because this 'send()' method is an async function we will make this method 
  'async' as well and then also await the code where we are using the 'send() method as well.


                                          async send(template, subject) {
                                            const html = pug.renderFile(`${__dirname}/../views/emails/${template}`, {
                                              firstName: this.firstName,
                                              url: this.url,
                                              subject
                                            })

                                            const mailOptions = {
                                              from: this.from,
                                              to: this.to,
                                              subject,
                                              html,
                                              text: htmlToText.fromString(html)
                                            }

                                            await this.newTransport().sendEmail(mailOptions)
                                          }

                                          async sendWelcome() {
                                            await this.send('welcome', 'Welcome to the Natours Family!');
                                          }


  EMAIL TEMPLATES WITH PUG: WELCOME EMAILS:

  Now we will use the power of pug to create a nice email template and then send a welcome email based on that template. So we have already created 'welcome.pug' and we will copy all of the data from the
  already provided template in the 'dev' directory in the 'emailTemplate.pug'. So jonas actually adapted that template from 'github' repository and then use an online tool in the website 'html2pug.now.sh'
  to convert that html template into pug template. Now whenever we are building an html email we always need to create inline styles. However this makes our file a bit noisy so we will cut that style code
  from here and paste it into a new file called '_style.pug' adjust the indentation using 'control + shift + p' and then select beautify pug. Then in our 'welcome' template we will simply write 'include _style'
  to include that code. The reasons that there are lot of tables in this template is because many email clients only understand tables for formating. However the important part from this is the 'Content'
  area under the 'Content' heading and this is what we will make dynamic. Now the thing is that we may have many different templates for our application and thats why we need a way of reusing all of the code
  that is outside of this 'Content'. So we will create a new template called 'baseEmail.pug' and move all of the code there. Then we will cut the 'Content' part from there and instead write 'block content'
  there and paste the code in 'welcome.pug'. At the top of this 'welcome' template we will write 'extends baseEmail' and then below that write 'block content' and move the code one indentation deep. 

  Now to make these template dynamic we will set 'title' equal to 'subject' that we passed as an object along with the template in the 'pug.renderFile'. Then for the content in the 'welcome' template we will 
  replace the name then button url and instead use those which we are providing the in object. We don't need to change anything else. 

  Now that our template is ready we are actually also ready to use our 'Email' class and send the email. Now ofcourse we want to send this welcome email whenever a user signs up so we will use it in the 
  'signup' handler function as well. So we will import this class in the 'authController' as 'Email' and in the 'signup' function we will use it as follow:

                                          await new Email(newUser, url).sendWelcome()           // We are using 'newUser' because that is what we are calling the new user in our 'signup' function.

  However before that we need to define this url because that url will be then injected in the email button and that button is to upload the user photo. So basically we want to point to that user account page
  using this button. So during development that url will be 'http://127.0.0.1:3000/me' but for production it will be something else. So instead we can make it dynamic we can get the protocol and hos data
  from the 'req' object. 

                                          const url = `${req.protocol}://${req.host}/me`
                                          await new Email(newUser, url).sendWelcome()

  And now a new user signsup then on its email he should get the email. However because we are in developement that email will be entrapped by 'mailtrap'. Also we haven't implemented the code to use the
  sendgrid package yet.

  SENDING PASSWORD RESET EMAILS:

  Next we also want to use this class to send the password reset emails as well. Now the template will be similar to our 'welcome' so we will copy the code and paste it in a new file called 'passwordReset.pug'.
  Now ofcourse we want to change the text message because instead of welcome we are sending the password reset url to the users. And we already have that text in our 'authController' in the 'forgotPassword'  
  function. Also we will make some other customization in using the url and text describing the button as well. 
  
  Next we will create another method in our 'Email' class called 'sendPasswordReset' and similarly to 'sendWelcome' we will call 'this.send()' method in here again but this time we will pass the template and
  subject for password reset.

                                          async sendPasswordReset() {
                                            await this.send('passwordReset', 'Your password reset token (valid for 10 minutes only)')
                                          }

  Then we will call this method in the 'forgotPassword' function where we previously were using 'sendEmail' function.

                                          await new Email(user, resetURL).sendPasswordReset    // Both 'user' and 'resetUrl' are already in this 'forgotPassword' function.

  USING SENDGRID TO SEND REAL EMAILS:

  Now for production we will use 'sendgrid' service to send the real emails. We will first create a free account for this which will allow us to send 100 emails per day. In the account dashboard there is a
  ton of stuff like 'stats' 'templates' etc but first we click on the drop down button link of our name and click on 'Setup Guide'. From there we will again click on 'Setup Guide' and then we will click
  on 'Integrate using our Web API or SMTP relay' option. From the new page we will click on 'SMTP Relay' option. From the next page we will create the name of our api key and lets use 'natours' for that and
  click on 'create key' button. We will then get 'username' and 'password' and for both of these we will create environment variables in 'config.env' file. 

  Next we will go to the 'newTransport' method and for the condition if the environment is 'production' we will write following:

                                          return nodemailer.createTransport({
                                            service: 'SendGrid',
                                            auth: {
                                              user: process.env.SENDGRID_USERNAME,
                                              pass: process.env.SENDGRID_PASSWORD
                                            }
                                          })

  And now when we are in production environment we will trigger above part of if condition and use 'SendGrid' service to send emails. Notice that we don't have to provide 'port' and 'host' information because 
  nodemailer already has preconfigured famous services like 'SendGrid'.

  CREDIT CARD PAYMENTS WITH STRIPE:

  In order to allow our users to buy tours we will implement stripe credit card payment in our application. We will first create our free account after which we will see a dashboard with the test mode. If we
  want to start accepting real payments we will have to activate our accounts and provide bunch of information about our business to stripe. In the dashboard we have menu from where we can check information
  about 'payments', 'disputes', 'Balance', 'customer' etc. In the payment section we will have all the information about the transaction that the customer did with us including amount, item, timeline etc
  however we won't have access to credit card number of the customer at any point.

  However before integrating stripe with our application we will define some settings. First we will change the name of our account and call it 'Natours'. We will then click on the 'branding' section to make
  our checkout pages in our application look more like our website design. We can change the 'icon', 'logo' and 'Accent color' from there.

  Next we will have to check our api keys which are 'Publishable key' which we will need use in the front end and 'Secret key' which we will have in the backend. Now there are many services offered by stripe
  and we are only interested in 'Payments' service. So if we look at payment service documentation we have 2 options. 1st is the stripe checkout page which we will use and the other is stripe elements which
  is used to implement our own checkout experience. Now if we select the checkout page we have then option to implement stripe only on client side or also on the server side. Now the option to integrate stripe
  only on the client side is used when our store is small with only a few products and the price of the products don't change. However we want a bit more complex system and therefore we will use server side
  integration.

  STRIPE WORKFLOW:

                  Now it all starts on the backend where we implement a route for so called stripe checkout session. This session is gonna contain a bunch of data about the object that can be purchased which
  in our case is tour. So session is gonna contain tour price, name, image, etc and some other information about the client as well.

                  Then in the front end we will implement a function to request a checkout session from the server once the user clicks the 'buy' button. So once we hit the endpoint in the backend above that
  will then create a session and send it back to the client. Based on that session stripe will automatically create the checkout page for us where the users can then input all of there details. Then using the
  session we will charge the card and for that we will need public key. 

  Finally after the payment is complete we can then use something called stripe web hooks in order to create new bookings. This side of the workflow however only runs in the deployed website and so we will 
  implement this part at the end of next section.
  
  INTEGRATING STRIPE INTO THE BACK-END:

  First we will create the booking routes and the booking controller just like we did for every other resource. Then in the 'bookingRoutes' we will import 'express', 'bookingController' and 'authController'. 
  We will create the router using the 'express.Router()' method. And then at the end export this module using 'module.exports = router'. Then in the app.js we will import this 'router' as 'bookingRouter'
  and use it as following:

                                          app.use('/api/v1/bookings', bookingRouter)

  And now we will create our first route here and this route will not follow the rest architechure as it is not for creating or getting or updating the bookings instead it is for checkout our users. We will
  also need to implement a url parameter for the tour id because we also want our clients to send the tour id because we will need it for our checkout session to fill the detail about our item such as the
  name and price. 
  
                                          router.get('/checkout-session:tourID', authController.protect, bookingController.getCheckoutSession)

  And now we will create the handler function for this route in the bookingController. In this file we will need to import 'Tour' model, 'catchAsync', 'factory' and 'AppError'. Like all of middleware function
  this 'getCheckoutSession' will have access to 'req, res, and next' and in the function body we will go through following steps in this handler function:

    1) GET THE CURRENTLY BOOKED TOUR:
                    
                                          exports.getCheckoutSession = catchAsync( async (req, res, next) {
                                            const tour = await Tour.findById(req.params.tourID)
                                          })

    3) CREATE THE CHECKOUT SESSION:

    For this we will first install the stripe npm package 'npm i stripe' and require it as 'stripe'. Then we will get secret stripe api key and save it in 'config.env' as 'STRIPE_SECRET_KEY'. Now requiring
    stripe will expose a function and usually what is done is to pass the secret key right into that.

                                          const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

    Next to create the checkout session we will use 'stripe.checkout.session.create()' and in here we will pass an object for options. Now there are many options that we can pass into this method but only
    3 of them are required. First option will be 'payment_method_types' and it will be an array which will take in the types of payments. We will put in 'card' in this array for credit cards. Next we will
    use the 'success_url' option and that is the option that will be called when the card is successfully charged. For our website we will want to redirect users to our homepage so we will use the dynamic
    url address `${req.protocol}://${req.get('host')}/`. Then we will also need to specify 'cancel_url' to redirect if the user choose to cancel the payment. We would want to send the users to the same tour
    page where they were previously `{req.protocol}://${req.get('host')}/tour/${tour.slug}`. Next we will also specify the customer email which is very useful because we already have access to customer email
    and we can make the checkout experience a lot smoother 'customer_email = req.user.email'. We can also specify a custom field called 'client_reference_id' and this field will allow us to pass in some data
    about the session that we are currently creating and it is important because once the purchase was successful we will then get access to this session object again and by then we will need to create a new
    booking in our database. And to create a new booking we will need the user id, the tour id and the price. Now in this session we already have access to 'user email' and from that we can recreate the user
    id because 'email' that we have is unique. We will specify the tour price in here and its only the tour id thats missing in this session which is used to create the booking. And therefore that is what we
    will specify in this custom field. So we will write 'client_reference_id: 'req.params.id'. Finally some detail about the product itself. First is the 'line_items' which accepts an array of objects basically
    one object per item. For each object we will give information about the tour's 'name', 'description', 'images' (will be an array and should be live images and this is another thing that we can only do once
    our website is deployed but for now we will use already deployed website), 'amount' (we will multiply by 100 because amount is expected in cents), 'currency' and finally 'quantity'.
      
                                          const session = await stripe.checkout.sessions.create({                  // awaiting because 'create' method returns a promise because of api calls etc. 
                                            payment_method_types: ['card'],
                                            success_url: `${req.protocol}://${req.get('host')}/`,
                                            cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
                                            customer_email: req.user.email,
                                            client_reference_id: req.params.tourId,
                                            line_items: [
                                              {
                                                name: `${tour.name} Tour`,
                                                description: `${tour.summary}`,
                                                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                                                amount: tour.price * 100,
                                                currency: 'usd',
                                                quantity: 1
                                              }
                                            ]
                                          })

    Important thing to rememeber is that we will have this 'session' object available to us after the payment is successful and then we will want to create the booking document. For creating booking document
    we need user id, tour id and price. And that is the reason we created the 'client_referenc_id' field and set it to 'req.params.tourId' because it was only the tour id which was not present in session
    object which we needed to create the booking document.

    3) CREAT SESSION AS RESPONSE:

    As a last step we will send this session back to the client.

                                          res.status(200).json({
                                            status: 'success',
                                            session
                                          })

    After all of this we can use postman and send the request to 'checkout-session:tourID' endpoint using tour id for any one of the tour and it will create the session. We can also verify that in our stripe
    dashboard as well and it will now have all of the information about item and price etc but the status will be incomplete. That is because we have only implemented the checkout session on the server side
    and we are missing the second step where we actually charge creadit card on the client side.

  PROCESSING PAYMENTS ON THE FRONT END:

    Now we want to allow our users to buy/book a tour from the front end. For this we will change the 'tour detail' page (i-e 'tour.pug') so that at the bottom of the page where for now we can click a button
    saying 'BOOK TOUR NOW'. However we want to make it dynamic such that only logged in users are able to see and book a tour but if the user is not logged in they are redirected to login page. So we will use
    the if condition to check if there is a 'user' and if it is then we will render that button and if not we will render another button which will be an 'anchor' link saying 'Log in to book tour'. Also it 
    will take the user to '/login' and we will do that using 'href' attribute.

    Now for 'Book Tour Now' button we also need to create an id 'book-tour' so that we can select it in our javascript (i-e index.js). Another thing is that our booking endpoint has the 'tourId' as a parameter 
    in the url for the tour that is being booked and we need to send the request using 'axios' to this endpoint using the tourId which is being bought by the customer. However frontend does not have access
    to that tour id so what we will do is that we will expose that tour id in this 'tour.pug' template so that it can be taken by the 'index.js' file. This is similar to what we did when working on the map 
    functionality. So to do that we will again use the 'data' attribute and then the name of the variable that we want.
    
                                          data-tour-id=`${tour.id}`   //tour-id is converted into 'tourId' when we access this from the javascript

    Next in the index.js we will look for an element with an id of 'book-tour' and if it exists we will add a 'click' event listener on that. In the callback function of that event listener we will first change
    the text of the button to 'Processing...' using the 'target' object that we get from the event object (e.target.textContent). Next we will get the tour id from the template and we can do that using 
    'e.target.dataset.tourId' and save it in a const called 'tourId' as well. And finally we will call the 'bookTour()' function (that we will define and import it here next) and give it the 'tourId' as input.

    Next we will create a javascript file 'stripe.js' in which we will define the 'bookTour' function. Now we will use the axios to send the request to our api so we will import it here. And also we will import
    the 'alerts.js' in here as we will use the 'try catch' blocks because we are making a request to external servers so there could be an error and we will show that message using our 'alerts'. Now we need
    to access to the 'stripe' library for our frontend as well. So although we installed the stripe npm package but that works for backend only. To access the stripe library in our frontend we will need to
    include a 'script' in our 'tour.pug' because we need it only here. So just like the 'mapbox' script, we will get the script from stripe checkout documentation and add that script at the top of our template.
    Next we will use the 'Stripe()' function and in its parenthesis we will pass the 'public key' to it and save the result in a const 'stripe'. So we used the 'secret' key like this in our backend and now we
    will need to pass the 'public' key in our frontend as well. We can get these keys from the 'developers' section of our dashboard.

                                          const stripe = Stripe('public api key')

    Next we will define the 'bookTour' and pass in a 'tourId'. We will divide this into two steps:

     1) GET THE CHECKOUT SESSION FROM API:
                                          We will simply make a get request to 'checkout-session:tourId' endpoint and save the response in a const 'session'. If we log the 'session' into the consol after the 
        request, then we will get an object and in that object we will have the 'data' field which will be another object containing the 'session' data which is again an object containing all of the data that
        we defined in the session object in our backend.

     2) CREATE CHECKOUT FORM AND CHARGE CREDIT CARD:

                                          In order to do above we will need to 'await the 'stripe.redirectToCheckout()' method and in the parenthesis we will pass an object in which we will pass only one
        option which is the 'sessionId' and it will be in 'session.data.session.id'.


                                          export const bookTour = tourId => {
                                            try {
                                              const session = await axios(
                                                `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`
                                              );

                                              await stripe.redirectToCheckout({
                                                sessionId: session.data.session.id
                                              });
                                            } catch (err) {
                                              console.log(err)
                                              showAlert('error', err)
                                            }
                                          }

    


                                          


    



*/

const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const tourRouter = require('./routes/tourRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in one hour!'
});

app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));

app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
