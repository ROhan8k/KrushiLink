#!/usr/bin/env python3
"""
KrushiLink Combined Server
Serves both static files and API endpoints
"""

import os
import json
import threading
import time
from flask import Flask, jsonify, request, send_from_directory, send_file
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Static file serving
@app.route('/')
def serve_index():
    return send_file('index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    try:
        return send_file(filename)
    except:
        # If file not found, serve index.html for SPA routing
        return send_file('index.html')

# Database connection
def get_db_connection():
    conn = psycopg2.connect(
        host=os.environ.get('PGHOST', 'localhost'),
        port=os.environ.get('PGPORT', '5432'),
        database=os.environ.get('PGDATABASE', 'main'),
        user=os.environ.get('PGUSER', 'user'),
        password=os.environ.get('PGPASSWORD', ''),
        cursor_factory=RealDictCursor
    )
    return conn

# Health check endpoint
@app.route('/api/health')
def health_check():
    return jsonify({"status": "ok", "message": "KrushiLink API is running"})

# Get all stores with their schemes
@app.route('/api/stores')
def get_stores():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get all stores
        cur.execute("""
            SELECT s.*, 
                   COALESCE(avg(c.rating), 0) as avg_rating,
                   COUNT(c.id) as total_reviews
            FROM stores s
            LEFT JOIN comments c ON s.id = c.store_id
            GROUP BY s.id
            ORDER BY s.id
        """)
        stores = cur.fetchall()
        
        # Convert to list of dicts and get schemes for each store
        stores_list = []
        for store in stores:
            store_dict = dict(store)
            
            # Get schemes for this store if it's a government store
            if store_dict['type'] == 'government':
                cur.execute("SELECT * FROM schemes WHERE store_id = %s", (store_dict['id'],))
                schemes = cur.fetchall()
                store_dict['schemes'] = [dict(scheme) for scheme in schemes]
            else:
                store_dict['schemes'] = []
            
            stores_list.append(store_dict)
        
        cur.close()
        conn.close()
        
        return jsonify(stores_list)
    
    except Exception as e:
        print(f"Error fetching stores: {e}")
        return jsonify({"error": str(e)}), 500

# Get a specific store by ID
@app.route('/api/stores/<int:store_id>')
def get_store(store_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get store with rating
        cur.execute("""
            SELECT s.*, 
                   COALESCE(avg(c.rating), 0) as avg_rating,
                   COUNT(c.id) as total_reviews
            FROM stores s
            LEFT JOIN comments c ON s.id = c.store_id
            WHERE s.id = %s
            GROUP BY s.id
        """, (store_id,))
        
        store = cur.fetchone()
        if not store:
            return jsonify({"error": "Store not found"}), 404
        
        store_dict = dict(store)
        
        # Get schemes for this store if it's a government store
        if store_dict['type'] == 'government':
            cur.execute("SELECT * FROM schemes WHERE store_id = %s", (store_id,))
            schemes = cur.fetchall()
            store_dict['schemes'] = [dict(scheme) for scheme in schemes]
        else:
            store_dict['schemes'] = []
        
        cur.close()
        conn.close()
        
        return jsonify(store_dict)
    
    except Exception as e:
        print(f"Error fetching store: {e}")
        return jsonify({"error": str(e)}), 500

# Filter stores
@app.route('/api/stores/filter')
def filter_stores():
    try:
        district = request.args.get('district', 'all')
        store_type = request.args.get('type', 'all')
        resource = request.args.get('resource', 'all')
        search = request.args.get('search', '')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Build the query
        query = """
            SELECT s.*, 
                   COALESCE(avg(c.rating), 0) as avg_rating,
                   COUNT(c.id) as total_reviews
            FROM stores s
            LEFT JOIN comments c ON s.id = c.store_id
            WHERE 1=1
        """
        params = []
        
        if district != 'all':
            query += " AND s.district ILIKE %s"
            params.append(f"%{district}%")
        
        if store_type != 'all':
            query += " AND s.type = %s"
            params.append(store_type)
        
        if resource != 'all':
            query += " AND %s = ANY(s.services)"
            params.append(resource)
        
        if search:
            query += " AND (s.name ILIKE %s OR s.description ILIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])
        
        query += " GROUP BY s.id ORDER BY s.id"
        
        cur.execute(query, params)
        stores = cur.fetchall()
        
        stores_list = []
        for store in stores:
            store_dict = dict(store)
            
            # Get schemes for government stores
            if store_dict['type'] == 'government':
                cur.execute("SELECT * FROM schemes WHERE store_id = %s", (store_dict['id'],))
                schemes = cur.fetchall()
                store_dict['schemes'] = [dict(scheme) for scheme in schemes]
            else:
                store_dict['schemes'] = []
            
            stores_list.append(store_dict)
        
        cur.close()
        conn.close()
        
        return jsonify(stores_list)
    
    except Exception as e:
        print(f"Error filtering stores: {e}")
        return jsonify({"error": str(e)}), 500

# Get comments for a store
@app.route('/api/stores/<int:store_id>/comments')
def get_comments(store_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT * FROM comments 
            WHERE store_id = %s 
            ORDER BY created_at DESC
        """, (store_id,))
        
        comments = cur.fetchall()
        cur.close()
        conn.close()
        
        return jsonify([dict(comment) for comment in comments])
    
    except Exception as e:
        print(f"Error fetching comments: {e}")
        return jsonify({"error": str(e)}), 500

# Add a comment
@app.route('/api/stores/<int:store_id>/comments', methods=['POST'])
def add_comment(store_id):
    try:
        data = request.get_json()
        
        if not data or not all(key in data for key in ['user_email', 'user_name', 'comment', 'rating']):
            return jsonify({"error": "Missing required fields"}), 400
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO comments (store_id, user_email, user_name, comment, rating)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING *
        """, (store_id, data['user_email'], data['user_name'], data['comment'], data['rating']))
        
        new_comment = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify(dict(new_comment)), 201
    
    except Exception as e:
        print(f"Error adding comment: {e}")
        return jsonify({"error": str(e)}), 500

# Delete a comment
@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    try:
        data = request.get_json()
        user_email = data.get('user_email')
        
        if not user_email:
            return jsonify({"error": "User email required"}), 400
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if comment exists and belongs to user
        cur.execute("""
            SELECT * FROM comments 
            WHERE id = %s AND user_email = %s
        """, (comment_id, user_email))
        
        comment = cur.fetchone()
        if not comment:
            return jsonify({"error": "Comment not found or unauthorized"}), 404
        
        # Delete the comment
        cur.execute("DELETE FROM comments WHERE id = %s", (comment_id,))
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({"message": "Comment deleted successfully"})
    
    except Exception as e:
        print(f"Error deleting comment: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)