from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile, Body
from sqlalchemy.orm import Session
from tables import Products, CheckoutInfo
from schemas import AddProductsbyUrlInfo, ProductsData, AddProductMetafield, EditProductsData
from tables import get_db
from func import generate_slug, save_upload_file
from typing import Optional, List

products_router = APIRouter()

@products_router.post("/add-photos-url", response_model=ProductsData)
async def add_new_photos_via_url(text: AddProductsbyUrlInfo, db: Session = Depends(get_db)):
    add_info_query = db.query(Products).filter(Products.title == text.title).first()

    if add_info_query:
        raise HTTPException(status_code=400, detail="A product under this title already exists. Please try another title")
    

    add_new_products = Products(
        title=text.title,
        slug=generate_slug(text.title),
        description=text.description,
        image_url=str(text.image_url),
        thumbnail_url=str(text.thumbnail_url) if text.thumbnail_url else None,
        image_file=None,
        thumbnail_file=None,
        price=text.price,
        is_for_sale=text.is_for_sale,
        resolution=text.resolution,
        file_size_mb=text.file_size_mb,
        file_format=text.file_format
    )

    db.add(add_new_products)
    db.commit()
    db.refresh(add_new_products)

    return add_new_products

@products_router.post("/add-photos-file", response_model=ProductsData)
async def add_new_photos_via_file_upload(title: str = Form(...), description: Optional[str] = Form(None), price: float = Form(...), is_for_sale: bool = Form(True), image_file: UploadFile = File(...), thumbnail_file: Optional[UploadFile] = File(None), db: Session = Depends(get_db)):
    add_info_query = db.query(Products).filter(Products.title == title).first()

    if add_info_query:
        raise HTTPException(status_code=400, detail="A product under this title already exists. Please try another title")
    
    if not image_file:
        raise  HTTPException(status_code=400, detail="Kindly provide an image file for this product")
    
    saved_image_file = save_upload_file(image_file)
    saved_thumbnail_file = save_upload_file(thumbnail_file) if thumbnail_file else None

    add_new_products = Products(
        title=title,
        slug=generate_slug(title),
        description=description,
        image_url=None,
        thumbnail_url=None,
        image_file= saved_image_file,
        thumbnail_file= saved_thumbnail_file,
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
    
    if (photo_query.resolution == text.resolution and photo_query.file_size_mb == text.file_size_mb and photo_query.file_format == text.file_format):
        raise HTTPException(status_code=400, detail= "Provided metafield info is the same as existing data. No update performed.")
     
    photo_query.resolution = text.resolution
    photo_query.file_size_mb = text.file_size_mb
    photo_query.file_format = text.file_format

    db.commit()
    db.refresh(photo_query)

    return photo_query

@products_router.post("/edit-photos-details", response_model=ProductsData)
async def edit_photo_entries(text: EditProductsData, product_id: Optional[int]= None, product_title: Optional[str] = None, db : Session = Depends(get_db)):
    if product_id:
        edit_table_query = db.query(Products).filter(Products.id == product_id).first()
    elif product_title:
        edit_table_query = db.query(Products).filter(Products.title == product_title).first()
    else:
        raise HTTPException(status_code=404, detail="Provide either Product ID or Title")
    
    if not edit_table_query:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if(edit_table_query.title == text.title and  edit_table_query.description == text.description 
       and edit_table_query.price == text.price and edit_table_query.resolution == text.resolution 
       and edit_table_query.file_size_mb == text.file_size_mb and edit_table_query.file_format == text.file_format):
        raise HTTPException(status_code=400, detail= "Provided data is the same as existing data. No update performed.")
    
    if text.title and text.title != edit_table_query.title:
        exists = db.query(Products).filter(Products.title == text.title).first()
        if exists:
            raise HTTPException(status_code=400, detail="Title already in use by another product")
        edit_table_query.title = text.title
    
    if text.description:
        edit_table_query.description = text.description
    if text.price:
        edit_table_query.price = text.price
    if text.resolution:
        edit_table_query.resolution = text.resolution
    if text.file_size_mb:
        edit_table_query.file_size_mb = text.file_size_mb
    if text.file_format:
        edit_table_query.file_format = text.file_format

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
        delete_photo_query = db.query(Products).filter(Products.id == product_id).delete()
    elif product_title:
        delete_photo_query = db.query(Products).filter(Products.title == product_title).delete()
    else:
        raise HTTPException(status_code=404, detail="Provide either Product ID or Title")
    
    if not delete_photo_query:
        raise HTTPException(status_code=404, detail="This artwork cannot be found in the Products table")
    
    db.commit()
    db.refresh(delete_photo_query)    
    return {"detail": f"Artwork ID {product_id} has been deleted from the table"}

@products_router.delete("/delete-all-photos")
async def delete_all_photos(db: Session = Depends(get_db)):
    all_photos = db.query(Products).all()
    for photos in all_photos:
        db.delete(photos) 

    db.commit()
    return {"detail": "All members have been deleted :("}