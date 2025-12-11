from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile, Body
from sqlalchemy.orm import Session
import cloudinary
import cloudinary.uploader
from schemas import AddProductsbyUrlInfo, ProductsData, AddProductMetafield, EditProductsData, PortfolioCreate, PortfolioResponse, PortfolioImageResponse, PicOfTheWeekResponse, AdminCreate
from tables import get_db, Admin, Products, OrderItem, Portfolio, PortfolioImages, PicOfTheWeek
from func import generate_slug, save_upload_file, create_thumbnail, save_pic_of_week, upload_pic_of_week, hash_password, verify_password
from typing import Optional, List
from urllib.parse import unquote

products_router = APIRouter()
portfolio_router = APIRouter()
poem_router = APIRouter()
admin_router = APIRouter()

@products_router.post("/add-photos-url", response_model=ProductsData)
async def add_new_photos_via_url(text: AddProductsbyUrlInfo, db: Session = Depends(get_db)):
    add_info_query = db.query(Products).filter(Products.title == text.title).first()

    if add_info_query:
        raise HTTPException(status_code=400, detail="A product under this title already exists. Please try another title")

    if db.query(Products).filter(Products.slug == generate_slug(text.title)).first():
        raise HTTPException(status_code=400, detail="Slug already exists. Please change the title.")

    upload_result = cloudinary.uploader.upload(
        str(text.image_url),
        folder="uploads",
        resource_type="image",
        overwrite=True,
    )
    thumbnail_info = create_thumbnail(image_url=str(text.image_url))

    add_new_products = Products(
        title=text.title,
        slug=generate_slug(text.title),
        description=text.description,
        image_url=upload_result["secure_url"],
        thumbnail_url=thumbnail_info["cloudinary_thumbnail_url"],
        price=text.price,
        is_for_sale=text.is_for_sale,
        dimensions=text.dimensions,
        resolution=text.resolution,
        file_size_mb=text.file_size_mb,
        file_format=text.file_format
    )

    db.add(add_new_products)
    db.commit()
    db.refresh(add_new_products)

    return add_new_products

@products_router.post("/add-photos-file", response_model=ProductsData)
async def add_new_photos_via_file_upload(title: str = Form(...), description: Optional[str] = Form(None), price: float = Form(...), is_for_sale: bool = Form(True), image_file: UploadFile = File(...), dimensions : Optional[str] = Form(None), db: Session = Depends(get_db)):
    add_info_query = db.query(Products).filter(Products.title == title).first()

    if add_info_query:
        raise HTTPException(status_code=400, detail="A product under this title already exists. Please try another title")
    
    if not image_file:
        raise  HTTPException(status_code=400, detail="Kindly provide an image file for this product")
    
    if db.query(Products).filter(Products.slug == generate_slug(title)).first():
        raise HTTPException(status_code=400, detail="Slug already exists. Please change the title.")
    
    saved_image_file = save_upload_file(image_file)
    saved_thumbnail_file = create_thumbnail(image_path=saved_image_file["local_path"])

    add_new_products = Products(
        title=title,
        slug=generate_slug(title),
        description=description,
        image_url=saved_image_file["cloudinary_url"],
        thumbnail_url=saved_thumbnail_file["cloudinary_thumbnail_url"],
        dimensions=dimensions,
        price=price,
        is_for_sale=is_for_sale
    )

    db.add(add_new_products)
    db.commit()
    db.refresh(add_new_products)

    return add_new_products

@products_router.post("/add-photo-metafield", response_model=ProductsData)
async def add_photo_metafield(product_id: Optional[int]= None, product_title: Optional[str] = None, text:AddProductMetafield=Body(...), db: Session = Depends(get_db)):
    if not product_id and not product_title:
        raise HTTPException(status_code=400, detail="Please provide either product_id or product_title.")

    if product_id:
        photo_query = db.query(Products).filter(Products.id == product_id).first()
    elif product_title:
        photo_query = db.query(Products).filter(Products.title == product_title).first()
    
    if not photo_query:
        raise HTTPException(status_code=404, detail="This artwork cannot be found in the Products table")
    
    if not text:
        raise HTTPException(status_code=404, detail="Kindly fill in all the required info")
    
    if (photo_query.dimensions == text.dimensions and photo_query.resolution == text.resolution and photo_query.file_size_mb == text.file_size_mb and photo_query.file_format == text.file_format):
        raise HTTPException(status_code=400, detail= "Provided metafield info is the same as existing data. No update performed.")
     
    photo_query.dimensions = text.dimensions
    photo_query.resolution = text.resolution
    photo_query.file_size_mb = text.file_size_mb
    photo_query.file_format = text.file_format

    db.commit()
    db.refresh(photo_query)

    return photo_query

@products_router.post("/edit-photos-details", response_model=ProductsData)
async def edit_photo_entries(update_data: EditProductsData, product_id: Optional[int]= None, product_title: Optional[str] = None, db : Session = Depends(get_db)):
    if product_id:
        edit_table_query = db.query(Products).filter(Products.id == product_id).first()
    elif product_title:
        edit_table_query = db.query(Products).filter(Products.title == product_title).first()
    else:
        raise HTTPException(status_code=404, detail="Provide either Product ID or Title")
    
    if not edit_table_query:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if(edit_table_query.title == update_data.title and  edit_table_query.description == update_data.description and edit_table_query.price == update_data.price 
       and edit_table_query.is_for_sale == update_data.is_for_sale and edit_table_query.dimensions == update_data.dimensions and edit_table_query.resolution == update_data.resolution 
       and edit_table_query.file_size_mb == update_data.file_size_mb and edit_table_query.file_format == update_data.file_format):
        raise HTTPException(status_code=400, detail= "Provided data is the same as existing data. No update performed.")
    
    if update_data.title and update_data.title != edit_table_query.title:
        exists = db.query(Products).filter(Products.title == update_data.title).first()
        if exists:
            raise HTTPException(status_code=400, detail="Title already in use by another product")
        edit_table_query.title = update_data.title

    edit_table_query.is_for_sale = update_data.is_for_sale
    if update_data.dimensions:
        edit_table_query.dimensions = update_data.dimensions
    if update_data.description:
        edit_table_query.description = update_data.description
    if update_data.price:
        edit_table_query.price = update_data.price
    if update_data.resolution:
        edit_table_query.resolution = update_data.resolution
    if update_data.file_size_mb:
        edit_table_query.file_size_mb = update_data.file_size_mb
    if update_data.file_format:
        edit_table_query.file_format = update_data.file_format

    db.commit()
    db.refresh(edit_table_query)

    return edit_table_query

@products_router.get("/view-photos-table", response_model=List[ProductsData])
async def view_photos_table(db: Session = Depends(get_db)):
    products_table_query = db.query(Products).all()

    if not products_table_query:
          raise HTTPException(status_code=400, detail="Products table cannot be found")
    
    return products_table_query


@products_router.get("/view-photos-table/{product}", response_model=List[ProductsData])
async def view_specific_artwork(product_id: Optional[int]= None, product_title: Optional[str]= None, db: Session = Depends(get_db)):
    if product_id:
        products_table_query = db.query(Products).filter(Products.id == product_id).all()
    elif product_title:
        products_table_query = db.query(Products).filter(Products.title == product_title).all()
    else:
        raise HTTPException(status_code=404, detail="Provide either Product ID or Title")
    
    if not products_table_query:
        raise HTTPException(status_code=404, detail="This artwork cannot be found in the Products table")
    
    return products_table_query


@products_router.delete("/delete-a-photo/{product}")
async def delete_a_photo(product_id: Optional[int]= None, product_title: Optional[str]= None, db: Session = Depends(get_db)):
    if product_id:
        delete_photo_query = db.query(Products).filter(Products.id == product_id).first()
    elif product_title:
        delete_photo_query = db.query(Products).filter(Products.title == product_title).first()
    else:
        raise HTTPException(status_code=404, detail="Provide either Product ID or Title")
    
    if not delete_photo_query:
        raise HTTPException(status_code=404, detail="This artwork cannot be found in the Products table")
    
    linked_order_item = db.query(OrderItem).filter(OrderItem.product_id == delete_photo_query.id).first()
    if linked_order_item:
        raise HTTPException(status_code=400, detail="Cannot delete this photo because it is linked to existing orders.")
    
    try:
        if delete_photo_query.image_url:
            public_id = delete_photo_query.image_url.split("/")[-1].split(".")[0]
            cloudinary.uploader.destroy(f"uploads/{public_id}", resource_type="image")

        if hasattr(delete_photo_query, "thumbnail_url") and delete_photo_query.thumbnail_url:
            thumb_id = delete_photo_query.thumbnail_url.split("/")[-1].split(".")[0]
            cloudinary.uploader.destroy(f"thumbnails/{thumb_id}", resource_type="image")

    except Exception as e:
        print("Cloudinary delete error:", e)

    db.delete(delete_photo_query)
    db.commit()
    return {"detail": f"Artwork {delete_photo_query.title} has been deleted from the table"}

@products_router.delete("/delete-all-photos")
async def delete_all_photos(db: Session = Depends(get_db)):
    all_photos = db.query(Products).all()

    for photos in all_photos:
        linked_order_item = db.query(OrderItem).filter(OrderItem.product_id == photos.id).first()
        if linked_order_item:
            raise HTTPException(status_code=400, detail="Cannot delete this photo because it is linked to existing orders.")
        try:
            if photos.image_url:
                public_id = photos.image_url.split("/")[-1].split(".")[0]
                cloudinary.uploader.destroy(f"uploads/{public_id}", resource_type="image")

            if hasattr(photos, "thumbnail_url") and photos.thumbnail_url:
                thumb_id = photos.thumbnail_url.split("/")[-1].split(".")[0]
                cloudinary.uploader.destroy(f"thumbnails/{thumb_id}", resource_type="image")

        except Exception as e:
            print("Cloudinary delete error:", e)

        db.delete(photos) 
    db.commit()
    return {"detail": "All members have been deleted :("}

@portfolio_router.post("/add-portfolio", response_model=PortfolioResponse)
async def add_new_portfolio(title: str = Form(...), category: str = Form(...), files: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    if db.query(Portfolio).filter(Portfolio.title == title).first():
        raise HTTPException(status_code=400, detail="Portfolio with this title already exists.")

    slug = generate_slug(title)
    if db.query(Portfolio).filter(Portfolio.slug == slug).first():
        raise HTTPException(status_code=400, detail="Slug already exists. Please change the title.")

    portfolio = Portfolio(title=title, slug=slug, category=category)
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)

    image_entries = []
    for file in files:
        saved_file = save_upload_file(file)
        upload_result = cloudinary.uploader.upload(
            saved_file["local_path"],
            folder=f"portfolio/{category}/{slug}",
            public_id=file.filename.rsplit('.', 1)[0],
            resource_type="image",
            overwrite=True
        )

        thumbnail_info = create_thumbnail(image_path=saved_file["local_path"], folder = "portfolio_thumbnail")

        portfolio_image = PortfolioImages(
            portfolio_id=portfolio.id,
            image_url=upload_result["secure_url"],
            thumbnail_url=thumbnail_info["cloudinary_thumbnail_url"]
        )
        db.add(portfolio_image)
        image_entries.append(portfolio_image)

    db.commit()
    for img in image_entries:
        db.refresh(img)

    portfolio.images = image_entries
    return portfolio

@portfolio_router.get("/view-all-portfolios", response_model=List[PortfolioResponse])
async def get_all_portfolios(db: Session = Depends(get_db)):
    portfolios = db.query(Portfolio).all()
    for portfolio in portfolios:
        portfolio.images = db.query(PortfolioImages).filter(PortfolioImages.portfolio_id == portfolio.id).all()
    return portfolios

@portfolio_router.get("/view-a-portfolio/{portfolio_id}", response_model=PortfolioResponse)
async def get_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    portfolio.images = db.query(PortfolioImages).filter(PortfolioImages.portfolio_id == portfolio.id).all()
    return portfolio

@portfolio_router.delete("/delete-portfolio/{portfolio_id}")
async def delete_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    for img in portfolio.images:
        try:
            if img.image_url:
                path = img.image_url.split("/upload/")[-1]
                public_id_with_ext = path.split("/", 1)[1] 
                public_id_with_ext = unquote(public_id_with_ext)  
                public_id = public_id_with_ext.rsplit(".", 1)[0] 
                cloudinary.uploader.destroy(public_id, resource_type="image")

            if img.thumbnail_url:
                thumb_id = img.thumbnail_url.split("/")[-1].split(".")[0]
                cloudinary.uploader.destroy(f"portfolio_thumbnail/{thumb_id}", resource_type="image")

        except Exception as e:
            print("Cloudinary deletion error:", e)

    db.query(PortfolioImages).filter(PortfolioImages.portfolio_id == portfolio.id).delete()
    db.delete(portfolio)
    db.commit()

    return {"message": "Portfolio deleted successfully"}

@portfolio_router.delete("/delete-all-portfolios")
async def delete_all_portfolios(db: Session = Depends(get_db)):
    portfolios = db.query(Portfolio).all()

    for portfolio in portfolios:
        for img in portfolio.images:
            try:
                if img.image_url:
                    path = img.image_url.split("/upload/")[-1]
                    public_id_with_ext = path.split("/", 1)[1] 
                    public_id_with_ext = unquote(public_id_with_ext)  
                    public_id = public_id_with_ext.rsplit(".", 1)[0] 
                    cloudinary.uploader.destroy(public_id, resource_type="image")

                if img.thumbnail_url:
                    thumb_id = img.thumbnail_url.split("/")[-1].split(".")[0]
                    cloudinary.uploader.destroy(f"portfolio_thumbnail/{thumb_id}", resource_type="image")
            except Exception as e:
                print("Cloudinary deletion error:", e)

        db.query(PortfolioImages).filter(PortfolioImages.portfolio_id == portfolio.id).delete(synchronize_session=False)
        db.delete(portfolio)
    db.commit()
    return {"message": "All portfolios deleted successfully"}

@poem_router.post("/add-pic-and-poem-of-the-week")
async def add_pic_of_the_week(upload_file: UploadFile, title: str = Form(...), poem: str = Form(...), db: Session = Depends(get_db)):
    try:
        image_info = await save_pic_of_week(upload_file) 
        cloud_url = upload_pic_of_week(image_path=image_info["local_path"])

        pic_record = PicOfTheWeek(title=title, image_url=cloud_url, poem=poem)
        db.add(pic_record)
        db.commit()
        db.refresh(pic_record)

        return {
            "message": "Pic of the Week added successfully",
            "Pic_of_week": {
                "id": pic_record.id,
                "title": pic_record.title,
                "image_url": pic_record.image_url,
                "poem": pic_record.poem
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@poem_router.get("/pic-of-the-week", response_model=List[PicOfTheWeekResponse])
async def get_all_pics_of_the_week(db: Session = Depends(get_db)):
    pics = db.query(PicOfTheWeek).all()
    return [
        {"id": pic.id, "image_url": pic.image_url, "poem": pic.poem}
        for pic in pics
    ]

@poem_router.get("/pic-of-the-week/{pic_id}", response_model=PicOfTheWeekResponse)
async def get_pic_of_the_week(pic_id: int, db: Session = Depends(get_db)):
    pic = db.query(PicOfTheWeek).filter(PicOfTheWeek.id == pic_id).first()
    if not pic:
        raise HTTPException(status_code=404, detail="Pic of the Week not found")
    return {"id": pic.id, "image_url": pic.image_url, "poem": pic.poem}
    
@poem_router.delete("/delete-pic-of-the-week/{pic_id}")
async def delete_pic_of_the_week(pic_id: int, db: Session = Depends(get_db)):
    pic_record = db.query(PicOfTheWeek).filter(PicOfTheWeek.id == pic_id).first()
    if not pic_record:
        raise HTTPException(status_code=404, detail="Pic of the Week not found")

    try:
        public_id = pic_record.image_url.split("/")[-1].split(".")[0]
        cloudinary.uploader.destroy(f"PicOfWeek/{public_id}", resource_type="image")
    except Exception:
        pass 

    db.delete(pic_record)
    db.commit()
    return {"message": "Pic of the Week deleted successfully"}

@poem_router.delete("/delete-all-pic-of-the-week")
async def delete_all_pic_of_the_week(db: Session = Depends(get_db)):
    pics = db.query(PicOfTheWeek).all()

    for pic in pics:
        try:
            if pic.image_url:
                public_id = pic.image_url.split("/")[-1].split(".")[0]
                cloudinary.uploader.destroy(f"PicOfWeek/{public_id}", resource_type="image")
        except Exception as e:
            print("Cloudinary deletion error:", e)

        db.delete(pic)
    db.commit()
    return {"message": "All Pic of the Week entries deleted successfully"}

@admin_router.post("/create-admin")
def create_admin(admin: AdminCreate, db: Session = Depends(get_db)):
    existing = db.query(Admin).filter(Admin.username == admin.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_pw = hash_password(admin.password)

    new_admin = Admin(
        username=admin.username,
        password=hashed_pw
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return {
        "message": "Admin created successfully",
        "admin_id": new_admin.id
    }

@admin_router.post("/admin-login")
def admin_login(admin:AdminCreate, db: Session = Depends(get_db)):
    if not admin.username:
        raise HTTPException(status_code=400, detail="Kindly provide a username")
    if not admin.password:
        raise HTTPException(status_code=400, detail="Kindly provide a password")
    
    admin_login = db.query(Admin).filter(Admin.username == admin.username).first()
    if not admin_login:
        raise HTTPException(status_code=400, detail="Incorrect username")
    
    if not verify_password(admin.password, admin_login.password):
        raise HTTPException(status_code=400, detail="Invalid password")

    return {
        "message": "Login successful",
        "admin_id": admin_login.id,
        "username": admin_login.username
    }


