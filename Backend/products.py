from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile, Body
from sqlalchemy.orm import Session
import cloudinary
import cloudinary.uploader
from tables import Products, CheckoutInfo
from schemas import AddProductsbyUrlInfo, ProductsData, AddProductMetafield, EditProductsData
from tables import get_db, OrderItem
from func import generate_slug, save_upload_file, create_thumbnail
from typing import Optional, List

products_router = APIRouter()

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
    db.delete(delete_photo_query)
    db.commit()
    return {"detail": f"Artwork ID {product_id} has been deleted from the table"}

@products_router.delete("/delete-all-photos")
async def delete_all_photos(db: Session = Depends(get_db)):
    all_photos = db.query(Products).all()
    for photos in all_photos:
        linked_order_item = db.query(OrderItem).filter(OrderItem.product_id == photos.id).first()
        if linked_order_item:
            raise HTTPException(status_code=400, detail="Cannot delete this photo because it is linked to existing orders.")
        db.delete(photos) 

    db.commit()
    return {"detail": "All members have been deleted :("}